require("./app.css")
import React from 'react'

import ThreeJs     from './components/webgl/three-js.react'
import MainToolbar from './components/MainToolbar'
import EntityInfos from './components/EntityInfos'


import postProcessMesh from './meshpp/postProcessMesh'
import helpers         from 'glView-helpers'
let centerMesh         = helpers.mesthTools.centerMesh

import AssetManager from 'usco-asset-manager'
import DesktopStore from 'usco-desktop-store'
import XhrStore     from 'usco-xhr-store'
import StlParser    from 'usco-stl-parser'
import CtmParser    from 'usco-ctm-parser'
import PlyParser    from 'usco-ply-parser'

import Kernel       from 'usco-kernel2'


import Rx from 'rx'
Rx.config.longStackSupport = true
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable

import {observableDragAndDrop} from './interactions/interactions'

import {fetchUriParams,getUriQuery,setWindowPathAndTitle}  from './utils/urlUtils'
import {first,toggleCursor,getEntity,hasEntity,extractMeshTransforms} from './utils/otherUtils'
import {getEntryExitThickness,
  getObjectPointNormal,
  computeCenterDiaNormalFromThreePoints,
  getDistanceFromStartEnd
} from './components/webgl/utils'

import {generateUUID} from 'usco-kernel2/src/utils'

import keymaster from 'keymaster'


import logger from './utils/log'
let log = logger("Jam-Root")
log.setLevel("info")

import state from './state'

import BomView from './components/Bom/BomView'
import ContextMenu from './components/ContextMenu'

////TESTING
import {selectEntities$,addEntityType$,addEntityInstances$, setEntityData$, deleteEntities$, duplicateEntities$, deleteAllEntities$ } from './actions/entityActions'
import {setToTranslateMode$, setToRotateMode$, setToScaleMode$} from './actions/transformActions'
import {showContextMenu$, hideContextMenu$, undo$, redo$, setDesignAsPersistent$, clearActiveTool$,setSetting$} from './actions/appActions'
import {newDesign$, setDesignData$} from './actions/designActions'
import {toggleNote$,toggleThicknessAnnot$,toggleDistanceAnnot$, toggleDiameterAnnot$, toggleAngleAnnot$} from './actions/annotActions'


let commands = {
  "undo":undo$,
  "redo":redo$,

  "removeEntities":deleteEntities$,
  "duplicateEntities":duplicateEntities$,
  "toTranslateMode":setToTranslateMode$, 
  "toRotateMode": setToRotateMode$, 
  "toScaleMode":setToScaleMode$
}


export default class App extends React.Component {
  constructor(props){
    super(props)

    this.state = state

    //TODO: store this elsewhere ? use stores system ?
    function getSourceData(){
      //let lastDesignName = localStorage.getItem("jam!-lastDesignName") || undefined
      let lastDesignUri  = localStorage.getItem("jam!-lastDesignUri") || undefined
      let persistent     = JSON.parse( localStorage.getItem("jam!-persistent") ) || false

      return {lastDesignUri, persistent} 
    }
    
    //this.state._lastDesignName= localStorage.getItem("jam!-lastDesignName") 
    //this.state.design.name    = this.state._lastDesignName || undefined
    
    let lastDesignUri  = localStorage.getItem("jam!-lastDesignUri") || undefined
    this.state.design.uri = lastDesignUri
    this.state.design._persistent = JSON.parse( localStorage.getItem("jam!-persistent") ) || false


    this.assetManager = new AssetManager()
    this.assetManager.addParser("stl", new StlParser())
    this.assetManager.addParser("ctm", new CtmParser())
    this.assetManager.addParser("ply", new PlyParser())

    this.assetManager.addStore( "desktop", new DesktopStore() )
    this.assetManager.addStore( "xhr"    , new XhrStore() )

    this.kernel = new Kernel(this.state)

    //temporary
    this.kernel.dataApi.store = this.assetManager.stores["xhr"]
    this.kernel.assetManager  = this.assetManager

    //test
    //this.kernel.testStuff()
    //throw new Error("AAAI")

    //FIXME: horrible
    if(this.state.design._persistent){
      this.kernel.setDesignAsPersistent(true,this.state.design.uri)
    } 

    let self = this
    let oldSetState = this.setState.bind(this)

    this._undos  = []
    this._redos  = []

    this.setState   = function(value, callback, alterHistory=true){
      function callbackWrapper(...params){
        if(callback) callback(params)
      }

      oldSetState(value, callback)
      if(alterHistory){
        let oldState = JSON.parse(JSON.stringify(self.state))//,function(key,val){
        console.log("adding history", self._undos)
        //})//Object.assign({},self.state)

        self._undos.push( oldState)
        self._redos = []
      }
    } 

  }

  componentWillUpdate(){
    //console.log("component will update")
    //this._tempForceDataUpdate()
  }

  componentDidMount(){
    let pjson = require('../package.json')
    this.setState(
    {
      appInfos:{
        ns : this.state.appInfos.ns,
        name: this.state.appInfos.name,
        version:pjson.version
      }  
    },null,false)
    ////////////////

    let self     = this
    
    let container = this.refs.wrapper.getDOMNode()

    let dnds$ = observableDragAndDrop(container)
    dnds$
      .map( drops=>drops.data)//.pluck(".data")
      .flatMap( Rx.Observable.fromArray )
      .subscribe((entry)=>{ self.loadMesh.bind(self,entry,{display:true})() } ) 

    let glview   = this.refs.glview
    
    function toolSelected(){
      return self.state.activeTool
    }

    //annoying
    function noToolSelected(){
      return !self.state.activeTool
    }

    let selectedMeshes$ = glview.selectedMeshes$
      .defaultIfEmpty([])
      .filter(noToolSelected)
      .subscribe(
        function(selections){
          let res= selections.filter(hasEntity).map(getEntity)
          selectEntities$(res)
        }
      )

    function attributesToArrays(attrs){
      let output= {}
      for(let key in attrs){
        output[key] = attrs[key].toArray()
      }
      //special case for rotation
      if("rot" in attrs)
      {
        output["rot"] = output["rot"].slice(0,3)
      }
      return output
    }

    function setEntityT(attrsAndEntity){
      let [transforms, entity] = attrsAndEntity      
      setEntityData$({entity:entity,
        pos:transforms.pos,
        rot:transforms.rot,
        sca:transforms.sca
      })

      return attrsAndEntity
    }

    //debounce 16.666 ie 60 fps ?

    let rawTranforms     =  glview.objectsTransform$
      .debounce(16.6666)
      .filter(hasEntity)
      .share()
      /*.map(getEntity)
      .map(extractMeshTransforms)
      .map(attributesToArrays)
      .subscribe( setEntityT )*/

    let objectTransforms = rawTranforms 
      .map(extractMeshTransforms)
      .map(attributesToArrays)
      .take(1)

    let objectsId = rawTranforms
      .map(getEntity)
      .take(1)

    let test = Observable.forkJoin(
      objectTransforms,
      objectsId
    )
    .repeat()
    .subscribe( setEntityT )

    ///////////
    //setup key bindings
    this.setupKeyboard()
    ///////////

    /////////
    //FIXME: not so great, this should not be here
        
    function updateDesign(design){
      console.log("updating design state")
      self.setState({
        design:design
      })
    }

    let design$ = require("./core/designModel")

    design$ = design$({
        newDesign$,
        setDesignData$,
        setAsPersistent$:setDesignAsPersistent$
      },
      Observable.just(self.state.design)
    )

    design$
      .distinctUntilChanged()//only do anything if there were changes
      .subscribe(function(data){    
        console.log("design change AA")
        updateDesign(data)
        setTimeout(self._tempForceDataUpdate.bind(self), 10)
      })
    //////SINK!!! save changes to design
    design$
      .distinctUntilChanged()//only save if something ACTUALLY changed
      //.skip(1) // we don't care about the "initial" state
      .debounce(1000)
      //seperation of "sinks" from the rest
      .filter(design=>design._persistent && (design.uri|| design.name))//only save when design is set to persistent
      .map(self.kernel.saveDesignMeta.bind(self.kernel))
      .subscribe(function(def){
        def.promise.then(function(result){
          //FIXME: hack for now
          console.log("save result",result)
          let serverResp =  JSON.parse(result)
          let persistentUri = self.kernel.dataApi.designsUri+"/"+serverResp.uuid

          localStorage.setItem("jam!-lastDesignUri",persistentUri)
          setDesignData$({uri:persistentUri})
        })
      })

    design$
      .pluck("_persistent")

      //seperation of "sinks" from the rest
      .subscribe(function(value){
        localStorage.setItem("jam!-persistent",value)
        if(value) self.kernel.setDesignAsPersistent(true)
      })

    //when creating a new design
    design$
      .combineLatest(
        newDesign$,
        x=>x
      )
      //.skipUntil(newDesign$)
      .subscribe(function(data){
        console.log("newDesign, reseting data")
        localStorage.removeItem("jam!-lastDesignUri")
        localStorage.removeItem("jam!-persistent")

        //remove meshes, resources etc
        self.assetManager.clearResources()
        self.kernel.clearAll()

        //clear window url etc
        setWindowPathAndTitle()
      })

    ///////////

    function updateEntities(entities){
      console.log("updating entities state")
      self.setState({
        entities:entities
      })
    }

    let entities$ = require("./core/entityModel")

    entities$ = entities$({
        addEntityType$,
        addEntities$:addEntityInstances$,
        setEntityData$, 
        deleteEntities$, 
        duplicateEntities$, 
        deleteAllEntities$,
        selectEntities$,

        newDesign$
      },
      Observable.just(self.state.entities)
    )

    entities$
      .subscribe(function(data){    
        updateEntities(data)
        //self._tempForceDataUpdate.bind(self)()
        setTimeout(self._tempForceDataUpdate.bind(self), 10)
      })

    
    //////SINK!!! save change to assemblies
    entities$
      .debounce(500)//don't save too often
      //seperation of "sinks" from the rest
      //.skipUntil(design$.filter(design=>design._persistent))//no saving when design is not persistent
      
      //FIXME !clunky as heck !!
      .combineLatest(design$,//no saving when design is not persistent
        (e,d)=> { return {e,d} })
      .filter((data) => data.d._persistent)
      .map((data)=>data.e)

      .subscribe(function(entities){
        console.log("GNO")
        self.kernel.saveBom()//TODO: should not be conflated with assembly
        self.kernel.saveAssemblyState(entities.instances)
      })
    ///////////
   
    function toggleTool(tool){
      self.setState({
        activeTool: tool
      },null,false)
    }

    function clearCursor(){
      document.body.style.cursor = 'default' 
    }

    let appState$ = require("./core/appModel.js")
    appState$ = appState$({
      setSetting$
    })

    appState$
      .subscribe(function(data){
        console.log("setting active tool etc",data)
        //toggleTool(data.activeTool)
        self.setState({
          appState:data
        },null,false)
      })
   
    appState$
      .pluck("activeTool")
      .filter((x)=> x === undefined)
      .subscribe(clearCursor)

    //////////////
    function updateAnnotations(annotations){
      console.log("updating annotations")
      self.setState({
        annotationsData:annotations
      })
    }

    let annotations$ = require("./core/annotationModel")

    annotations$ = annotations$({
        singleTaps$:glview.singleTaps$, 
        activeTool$:appState$.map(aS=>aS.activeTool),
        deleteAnnots$:deleteEntities$
      },
      self.state.annotationsData
    ).share()

    annotations$
      .subscribe(function(data){
        clearActiveTool$()
        updateAnnotations(data)
        setTimeout(self._tempForceDataUpdate.bind(self), 10)
      })
    //////SINK!!! save change to assemblies
    annotations$
      .debounce(500)//don't save too often
      .subscribe(function(annotations){
        self.kernel.saveAnnotations(annotations)
      })
    /////////////

    showContextMenu$
      .skipUntil(appState$.filter(appState=>appState.mode !=="viewer"))//no context menu in viewer mode
      .subscribe(function(requestData){
      console.log("requestData",requestData)
      //let selectedEntities = self.state.selectedEntities

      //TODO: refactor
      let selectedEntities = self.state.entities.selectedEntitiesIds
        .map(entityId => self.state.entities.entitiesById[entityId])
        .filter(id => id!==undefined)

      let selectIds = self.state.entities.selectedEntitiesIds
      let selectedAnnots = self.state.annotationsData
        .filter( (annot) => { return selectIds.indexOf(annot.iuid) > -1} )

      selectedEntities = selectedEntities.concat(selectedAnnots)

      let active = true//(selectedEntities && selectedEntities.length>0)
      let actions = []

      //default actions ?
      actions = [
        {name:"Import file (NA)",action:undefined},
        {name:"Export design (NA)",action:undefined},
        {name:"Delete all",action:deleteAllEntities$},

          {name:"Distance",action:toggleDistanceAnnot$},
          {name:"Angle",action:toggleAngleAnnot$},
      ]

      if(selectedEntities && selectedEntities.length>0)
      {
         actions=[
          {name:"Delete",action: deleteEntities$},
          {name:"Duplicate",action:duplicateEntities$},
              {name:"Note",action:toggleNote$},
              {name:"Distance",action:toggleDistanceAnnot$},
              {name:"Thickness",action:toggleThicknessAnnot$},
              {name:"Diameter",action:toggleDiameterAnnot$},
              {name:"Angle",action:toggleAngleAnnot$}
          /*{
            name:"Annotations", 
            items:[
              {name:"Note",action:toggleNote$},
              {name:"Distance",action:toggleDistanceAnnot$},
              {name:"Thickness",action:toggleThicknessAnnot$},
              {name:"Diameter",action:toggleDiameterAnnot$},
              {name:"Angle",action:toggleAngleAnnot$}
            ]
          }*/
         ]
      }
      //TODO: this is ui state, not logic state
      self.setState({
        contextMenu:{
          active:active,
          position:requestData.position,
          //not sure about all these
          selectedEntities:selectedEntities,
          actions,
        }
      },null, false)
    })

    hideContextMenu$.subscribe(function(requestData){
      self.setState({
        contextMenu:{
          active:false,
        }
      },null, false)
    })


    undo$.subscribe(function(){
      console.log("UNDO")
      function afterSetState(){
        self._tempForceDataUpdate()
      }
      if(self._undos.length<2) return

      let lastState = self._undos.pop()
      self._redos.push(lastState)

      let prevState = self._undos[self._undos.length-1] //.pop()
      self.setState(prevState, afterSetState,false)
      
    })

    redo$.subscribe(function(){
      console.log("REDO")

      function afterSetState(){
        self._tempForceDataUpdate()
      }
      let lastState = self._redos.pop()
      if(!lastState) return

      self._undos.push(lastState)
      self.setState(lastState,afterSetState,false)
    })

    //fetch & handle url parameters
    let mainUri    = window.location.href 
    let uriQuery   = getUriQuery(mainUri)
    let designUrls = fetchUriParams(mainUri, "designUrl")
    let meshUrls   = fetchUriParams(mainUri, "modelUrl")
    let appMode    = fetchUriParams(mainUri, "appMode")

    if(appMode.length > 0){
      setSetting$({path:"mode",value:appMode.pop()})
    }
    
    
    //TODO , refactor all these
    //only handle a single design url
    let singleDesign = designUrls.pop()
    if(singleDesign){
      designUrls = [singleDesign]

      setDesignData$({uri:singleDesign})
      this.kernel.setDesignAsPersistent(true, this.state.design.uri)
    }
    //if(designUrls) { newDesign$() }
    designUrls.map(function( designUrl ){ self.loadDesign(designUrl) })


    //only load meshes if no designs need to be loaded 
    if(!singleDesign) meshUrls.map(function( meshUrl ){ self.loadMesh(meshUrl) })

    let persistentUri = this.state.design.uri
    //from localstorage in case all else failed
    if(!singleDesign && persistentUri)
    {
      this.loadDesign(persistentUri)

      setWindowPathAndTitle(window.location.href + "?designUrl="+ persistentUri)
    }

    //last but not least, try to load if anything is in the query (shorthand for design uuids)
    if(!singleDesign &&! meshUrls && !persistentUri && uriQuery)
    {
      //FIXME: this does not seem right ...
      let apiDesignsUri = "https://jamapi.youmagine.com/api/v1/designs/"//self.kernel.dataApi.designsUri
      let designUri = apiDesignsUri+uriQuery 
      self.loadDesign(designUri)
    }


  }

  //event handlers
  setupKeyboard(){
    let self = this
    //non settable shortcuts
    //prevent backspace
    keymaster('backspace', function(){ 
      return false
    })
    keymaster('F11', function(){ 
      //self.handleFullScreen()
    })

    //deal with all shortcuts
    let shortcuts = this.state.shortcuts
    shortcuts.map(function(shortcutEntry){
      let {keys, command} = shortcutEntry

      keymaster(keys, function(){ 
        console.log(`will do ${command}`)
        if(command in commands){
          commands[command](self.state.selectedEntities)
        }
        return false
      })

    })
   
    //TAKEN FROM ESTE
    // For Om-like app state persistence. Press shift+ctrl+s to save app state
    // and shift+ctrl+l to load.
    keymaster('shift+ctrl+s',function(){
      window._appState = state.save()
      window._appStateString = JSON.stringify(window._appState)
      console.log('app state saved')
      console.log('copy the state to your clipboard by calling copy(_appStateString)')
      console.log('for dev type _appState and press enter')
    })

     keymaster('shift+ctrl+l',function(){
      const stateStr = window.prompt('Copy/Paste the serialized state into the input')
      const newState = JSON.parse(stateStr)
      if (!newState) return
      state.load(newState)
    })

  }

  unsetKeyboard(){
    //keymaster.unbind('esc', this.onClose)
  }

  //api 
  loadDesign(uri,options){
    log.warn("loading design from ",uri)
    let self = this

    function logNext( next ){
      log.info( next )
    }
    function logError( err){
      log.error(err)
    }
    function onDone( data) {
      log.info("DONE loading design",data)
      
      setDesignData$({
      //newDesign$({
        name: self.kernel.activeDesign.name,
        description:self.kernel.activeDesign.description,
        authors:self.kernel.activeDesign.authors || [],
        tags:self.kernel.activeDesign.tags || [],
        licenses:self.kernel.activeDesign.licenses || [],
        uri:self.state.design.uri
      })
      
      //FIXME: godawful hack because we have multiple "central states" for now
      self.kernel.activeAssembly.children.map(
        function(entityInstance){
          addEntityInstance$(entityInstance)
        }
      )
      //self._tempForceDataUpdate()
    }
    //FIXME : hack hack hack
    this.kernel.dataApi.rootUri = this.state.design.uri

    this.kernel.loadDesign(uri,options)
      .subscribe( logNext, logError, onDone)
  }


  
  //-------COMMANDS OR SOMETHING LIKE THEM -----

  /*duplicate all given instances of entities*/
  duplicateEntities( instances ){
    log.info("duplicating entity instances", instances)
    let self  = this
    let dupes = []

    instances.map(function(instance){
      let duplicate = self.kernel.duplicateEntity(instance)
      dupes.push( duplicate )
      //FIXME: this is redundant  
      $addEntityInstance(duplicate)
    })

    return dupes
  }

  //API
  loadMesh( uriOrData, options ){
    log.info("loading mesh")
    const DEFAULTS={
      display:true,//addToAssembly
      keepRawData:true
    }
    let options = Object.assign({},DEFAULTS,options)
    
    if(!uriOrData) throw new Error("no uri or data to load!")

    let self = this
    let resource = this.assetManager.load( uriOrData, {keepRawData:true, parsing:{useWorker:true,useBuffers:true} } )
    let dataSource = Rx.Observable.fromPromise(resource.deferred.promise)

    
    function handleLoadError( err ){
       log.error("failed to load resource", err, resource.error)
       //do not keep error message on screen for too long, remove it after a while
       setTimeout(cleanupResource, self.dismissalTimeOnError)
       return resource
    }
    function cleanupResource( resource ){
      log.info("cleaning up resources")
      self.assetManager.dismissResource( resource )
    }

    function registerMeshOfPart( mesh ){
      //part type registration etc
      //we are registering a yet-uknown Part's type, getting back an instance of that type
      let {partKlass,typeUid}    = self.kernel.registerPartType( null, null, mesh, {name:resource.name, resource:resource} )
      addEntityType$( {type:partKlass,typeUid} )

      //we do not return the shape since that becomes the "reference shape/mesh", not the
      //one that will be shown
      return partKlass
    }

    function showEntity( partKlass ){
      let partInstance = undefined
      if( options.display ){

        partInstance = self.kernel.makePartTypeInstance( partKlass )
        self.kernel.registerPartInstance( partInstance )
      
        //this needs to be added somewhere
        //partInstance.bbox.min = shape.boundingBox.min.toArray()
        //partInstance.bbox.max = shape.boundingBox.max.toArray()  
    
        //self.addEntityInstance(partInstance)
        addEntityInstances$(partInstance)
      }
      return partInstance
    }

    dataSource
      .map( postProcessMesh )
      .map( centerMesh )
      .map( registerMeshOfPart )
      .map( showEntity )
      .map( function(instance){
        //klassAndInstance.instance.pos[2]+=20
        return instance
      })
      /*.map( kI => kI.instance)
      .map( self.selectEntities.bind(this) )*/
      .catch(handleLoadError)
      .subscribe(self._tempForceDataUpdate.bind(self))
  }


  /*temporary method to force 3d view updates*/
  _tempForceDataUpdate(){
    log.info("forcing re-render")
    if(!this.state.entities) return

    let self     = this
    let kernel   = this.kernel
    let glview   = this.refs.glview
    let assembly = this.kernel.activeAssembly
    let entries  = this.state.entities.instances// assemblies_main_children

    let annotationsData = this.state.annotationsData //FIXME : HACK obviously
    
    //let selectedEntities = this.state.selectedEntitiesIds.map(entityId => self.state._entitiesById[entityId])
    let selectedEntitiesIds = this.state.entities.selectedEntitiesIds

    //let bla = annotationsData.filter((annot)=>annot.uid.indexOf(this.state.selectedEntitiesIds))

    let meshCache = {}

    //mesh insertion post process
    function meshInjectPostProcess( mesh ){
      //FIXME: not sure about these, they are used for selection levels
      mesh.selectable      = true
      mesh.selectTrickleUp = false
      mesh.transformable   = true
      //FIXME: not sure, these are very specific for visuals
      mesh.castShadow      = true
      //mesh.receiveShadow = true
      return mesh
    }

    function applyEntityPropsToMesh( inputs ){
      let {entity, mesh} = inputs
      mesh.userData.entity = entity//FIXME : should we have this sort of backlink ?
      //FIXME/ make a list of all operations needed to be applied on part meshes
      //computeObject3DBoundingSphere( meshInstance, true )
      //centerMesh( meshInstance ) //FIXME do not use the "global" centerMesh
      mesh.position.fromArray( entity.pos )
      mesh.rotation.fromArray( entity.rot )
      mesh.scale.fromArray(  entity.sca )
      mesh.material.color.set( entity.color )
      return mesh
    }

    /*function that provides a mapping between an entity and its visuals (in this case 
    // a 3d object/mesh)
      @param entity : the entity to get the mapping of
      @param addTo : item to add the visual to
      @param xform : any extra tranformation to apply to the entity
    */
    function mapper( entity, addTo, xform, mappings){
      let foo= Rx.spawn(function* (){

        let mesh = yield kernel.getPartMeshInstance( entity ) 

        //log.debug("meshInstanceRXJS",mesh, entity)

        //meshCache[entity.iuid] = mesh

        Observable.just({mesh,entity})//stupid hack
          .map(applyEntityPropsToMesh)
          .map(meshInjectPostProcess)        
          .map(function(mesh){
            //log.info("instance",mesh)
            if (addTo) addTo.add( mesh)
            if (xform) xform(entity,mesh)
            return mesh
          })
          .subscribe(()=>{})
      })()
    }

    function mapper2( entity , stream){
      let foo= Rx.spawn(function* (){
        let mesh = yield kernel.getPartMeshInstance( entity ) 
        Observable.just({mesh,entity})//stupid hack
          .map(applyEntityPropsToMesh)
          .map(meshInjectPostProcess)        
          .map(function(mesh){          
            return mesh
          })
          .subscribe(()=>{})
      })()
    }

    let fooStreams = []
    entries.map(function(entity){
      //let stream = new Rx.Subject()
    })

    glview.forceUpdate({
      data:entries, 
      mapper:mapper.bind(this), 
      selectedEntities:selectedEntitiesIds,
      metadata:annotationsData})

  }
  
  render() {

    let wrapperStyle = {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom:0,
      right:0,
      width:'100%',
      height:'100%',
      overflow:'hidden'
    }
    let infoLayerStyle = {
      color: 'red',
      width:'400px',
      height:'300px',
      zIndex:15,
      position: 'absolute',
      right: 0,
      top: "42px"
    }

    let titleStyle = {
      position: 'absolute',
      left: '50%',
      top: 0,
    }
    let testAreaStyle = {
      position: 'absolute',
      left: 0,
      bottom:0
    }

    let toolbarStyle={
      width:'100%',
      height:'100%',
    }
    
    let bomData = this.kernel.bom.bom

    //TODO: do this elsewhere
    window.document.title = `${this.state.design.name} -- Jam!`

    let self=this
    let contextmenuSettings = this.state.contextMenu
    let selectedEntities = []
    if(this.state.entities.selectedEntitiesIds)
    {
      selectedEntities= this.state.entities.selectedEntitiesIds
      .map(entityId => self.state.entities.entitiesById[entityId])
      .filter(id => id!==undefined)

      let selectIds = this.state.entities.selectedEntitiesIds
      let selectedAnnots = this.state.annotationsData
        .filter( (annot) => { return selectIds.indexOf(annot.iuid) > -1} )
      
      selectedEntities = selectedEntities.concat(selectedAnnots)
  }

    //console.log("selectedAnnots",selectedAnnots )//,selectIds,this.state.annotationsData)
    return (
        <div ref="wrapper" style={wrapperStyle} className="Jam">
          <MainToolbar 
            design={this.state.design} 
            appInfos={this.state.appInfos} 

            activeTool={this.state.appState.activeTool}
            settings={this.state.appState}
            mode={this.state.appState.mode}

            undos = {this._undos}
            redos = {this._redos}
            style={toolbarStyle}> </MainToolbar>

          <ThreeJs ref="glview" 
            activeTool={this.state.appState.activeTool} 
            showAnnotations={this.state.appState.annotations.show}/>

          <div ref="testArea" style={testAreaStyle} className="toolBarBottom">
            <EntityInfos 
              entities={selectedEntities} 
              mode={this.state.appState.mode}
              debug={false}
            />
          </div>

          <ContextMenu settings={contextmenuSettings} />

        </div>
    )
  }
}
