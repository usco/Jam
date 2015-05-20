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
/*import AMfParser    from 'usco-amf-parser'
import ObjParser    from 'usco-obj-parser'*/
//import registerReact from 'reactive-elements'

import Kernel       from 'usco-kernel2'


import Rx from 'rx'
Rx.config.longStackSupport = true
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable

import {observableDragAndDrop} from './interactions/interactions'

import {fetchUriParams,getUriQuery}  from './utils/urlUtils'


import keymaster from 'keymaster'


import logger from './utils/log'
let log = logger("Jam-Root")
log.setLevel("info")

import state from './state'

import BomView from './components/Bom/BomView'
import ContextMenu from './components/ContextMenu'

////TESTING
import * as blar from './core/fooYeah'
import {addEntityInstances$, setEntityData$, deleteEntities$, duplicateEntities$ } from './actions/entityActions'
import {setToTranslateMode, setToRotateMode, setToScaleMode} from './actions/transformActions'
import {showContextMenu$, hideContextMenu$, undo, redo, setDesignAsPersistent$} from './actions/appActions'
import {newDesign$, setDesignData$} from './actions/designActions'

let commands = {
  "undo":undo,
  "redo":redo,

  "removeEntities":deleteEntities$,
  "duplicateEntities":duplicateEntities$,
  "toTranslateMode":setToTranslateMode, 
  "toRotateMode": setToRotateMode, 
  "toScaleMode":setToScaleMode
}


export default class App extends React.Component {
  constructor(props){
    super(props)

    this.state = state
    //TODO: store this elsewhere ? use stores system ?
    this.state._lastProjectName= localStorage.getItem("jam!-lastProjectName") 
    this.state.design.name    = this.state._lastProjectName || undefined
    
    let lastProjectUri  = localStorage.getItem("jam!-lastProjectUri") || undefined
    this.state.design._persistentUri = lastProjectUri
    this.state._persistent     = JSON.parse( localStorage.getItem("jam!-persistent") ) || false


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

    if(this.state._persistent){
      this.kernel.setDesignAsPersistent(true)
      this.kernel.dataApi.rootUri = lastProjectUri
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
      .map( (drops) => {log.info("data was dropped into jam!", drops);return drops})
      .map( (drops)=>drops.data)//.pluck(".data")
      .flatMap( Rx.Observable.fromArray )
      .subscribe((entry)=>{ self.loadMesh.bind(self,entry,{display:true})() } ) 


    let glview   = this.refs.glview
    

    //get entities 
    function entitiesOnly( x ){
      return (x.userData && x.userData.entity)
    }

    function getEntity( x ){
      console.log(x)
      return x.userData.entity
    }

    let selectedMeshes$ = glview.selectedMeshes$
      .defaultIfEmpty([])
      .subscribe(
        function(selections){
          let res= selections.filter(entitiesOnly).map(getEntity)
          self.selectEntities(res)
        }
      )

    function extractAttributes(mesh){
      let attrs = {
        pos:mesh.position,
        rot:mesh.rotation,
        sca:mesh.scale
      }
      return attrs
    }

    function attributesToArrays(attrs){
      console.log("here")
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
      console.log("bla")
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
      .filter(entitiesOnly)
      .share()
      /*.map(getEntity)
      .map(extractAttributes)
      .map(attributesToArrays)
      .subscribe( setEntityT )*/

    let objectTransforms = rawTranforms 
      .map(extractAttributes)
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

    /*var bla = objectsTransform
    .debounce(16)
    .filter(entitiesOnly)
 
    var eId = bla.map(getEntity).map('.iuid').toProperty(-1)
    var pos = bla.map('.position').map(toArray).toProperty([0,0,0])
    var rot = bla.map('.rotation').map(toArray).toProperty([0,0,0])
    var sca = bla.map('.scale').map(toArray).toProperty([0,0,0])
     
    var endTranforms = Bacon.combineTemplate(
      {entityId:eId, 
       pos:pos,
       rot:rot,
       sca:sca}
    ).onValue(function(value){
      console.log("transforms value",JSON.stringify(value))
    })*/
    

    ///////////
    //setup key bindings
    this.setupKeyboard()
    ///////////

    /////////
    //FIXME: horrible, this should not be here, all related to actions etc
    addEntityInstances$
      .map(self.addEntityInstance.bind(self))
      .subscribe(self._tempForceDataUpdate.bind(self))

    setEntityData$
      .debounce(3)
      .map(self.setEntityData.bind(self))
      .subscribe(self._tempForceDataUpdate.bind(self))

    /*setEntityTransforms
      .subscribe(function(val){
        self.setEntityTransforms(val.entity, val.transforms)
        self._tempForceDataUpdate()
      })*/

    deleteEntities$
      .map(self.removeEntityInstances.bind(self))
      .map(self.selectEntities.bind(self))//reset selection

      .subscribe(self._tempForceDataUpdate.bind(self))

    duplicateEntities$
      .map(self.duplicateEntities.bind(self))
      .map(self.selectEntities.bind(self))//set selection to new ones

      .subscribe(self._tempForceDataUpdate.bind(self))

    setDesignAsPersistent$
      .map(function(){
        let value = !self.state._persistent
        self.setState({_persistent:value},null,false)
        return value
      })

      //seperation of "sinks" from the rest
      .subscribe(function(value){
        localStorage.setItem("jam!-persistent",value)
        if(value) self.kernel.setDesignAsPersistent(true)
      })
      //.subscribe((value)=>localStorage.setItem("jam!-persistent",value))

    setDesignData$
      .map(self.setDesignData.bind(self))

      //seperation of "sinks" from the rest
      .filter(()=>self.state._persistent)//only save when design is set to persistent
      .debounce(1000)
      .map(self.kernel.saveDesignMeta.bind(self.kernel))
      .subscribe(function(def){
        def.promise.then(function(result){
          //FIXME: hack for now
          console.log("save result",result)
          let serverResp =  JSON.parse(result)
          let persistentUri = self.kernel.dataApi.designsUri+"/"+serverResp.slug

          localStorage.setItem("jam!-lastProjectUri",persistentUri)
        })
        localStorage.setItem("jam!-lastProjectName",self.state.design.name)

      })

    newDesign$
      .subscribe(function(){
        //TODO : this needs to be elsewhere
        const defaultDesign = {
          name:undefined,
          description:undefined,
          version: undefined,//"0.0.0",
          authors:[],
          tags:[],
          licenses:[],
          meta:undefined,
        }

        self.setState({
          _persistent:false,

          design:defaultDesign,
          selectedEntities:[],
          selectedEntitiesIds:[],
          assemblies_main_children:[],
          _entityKlasses:{},
          _entitiesById: {}
        },null,false)

        localStorage.removeItem("jam!-lastProjectName")
        localStorage.removeItem("jam!-lastProjectUri")
        localStorage.removeItem("jam!-persistent")

        //remove meshes, resources etc
        self.assetManager.clearResources()
        self.kernel.clearAll()

        //clear url related stuff
        let urlPath   = location.protocol + '//' + location.host + location.pathname
        let pageTitle = "" 
        document.title = pageTitle
        window.history.pushState({"pageTitle":pageTitle},"", urlPath)

        self._tempForceDataUpdate()
      })

    //////handle overall change pertinent to assemblies
    let modelChanges$ = Observable.merge([
      addEntityInstances$,
      deleteEntities$,
      duplicateEntities$,
      setEntityData$,
    ])
      .debounce(500)//don't save too often

      //seperation of "sinks" from the rest
      .filter(()=>self.state._persistent)//only save when design is set to persistent
      .subscribe(function(){
        self.kernel.saveBom()//TODO: should not be conflated with assembly
        self.kernel.saveAssemblyState(self.state.assemblies_main_children)
      })

    /*
    let foo$ = Rx.Observable.combineLatest(
      setEntityTransforms,
      setEntityColor,
      //deleteEntities,
      //duplicateEntities$,
      function(transforms, color){
        console.log("here")
        let key = transforms.entity.iuid

        let entities = {
        }

        entities[key] = {
          name:transforms.entity.name,
          t:transforms.transforms,
          c:color.color
        }

        return entities
      }
    )
   
    foo$.subscribe(
      function(data){
        console.log("hi there, the model changed!",data)
      },
      function(bla){console.log("heredsf")},
      function(bla){console.log("error")}
      )*/



    /////This is ok here ??
    ///////////
    
    showContextMenu$.subscribe(function(requestData){
      console.log("requestData",requestData)
      let selectedEntities = self.state.selectedEntities
      let active = true//(selectedEntities && selectedEntities.length>0)
      let actions = []

      //default actions ?
      actions = [
        {name:"Import file (NA)",action:undefined},
        {name:"Export design (NA)",action:undefined}
      ]

      if(selectedEntities && selectedEntities.length>0)
      {
         actions=[
          {name:"Delete",action: deleteEntities$},
          {name:"Duplicate",action:duplicateEntities$},

          {
            name:"Annotations", 
            items:[
              {name:"Note",action:undefined},
              {name:"Distance",action:undefined},
              {name:"Thickness",action:undefined},
              {name:"Diameter",action:undefined},
              {name:"Angle",action:undefined}
            ]
          }
         ]
      }
      //TODO: this is ui state, not logic state
      self.setState({
        contextMenu:{
          active:active,
          position:requestData.position,
          //not sure about all these
          selectedEntities:self.state.selectedEntities,
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


    undo.subscribe(function(){
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

    redo.subscribe(function(){
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
    
    //TODO , refactor all these
    //only handle a single design url
    let singleDesign = designUrls.pop()
    if(singleDesign){
      designUrls = [singleDesign]
      this.kernel.setDesignAsPersistent(true)
      this.kernel.dataApi.rootUri = this.state.design._persistentUri
    }
    //if(designUrls) { newDesign$() }
    designUrls.map(function( designUrl ){ self.loadDesign(designUrl) })

    //only load meshes if no designs need to be loaded 
    if(!singleDesign)meshUrls.map(function( meshUrl ){ self.loadMesh(meshUrl) })

    let persistentUri = this.state.design._persistentUri
    //from localstorage in case all else failed
    if(!singleDesign && persistentUri)
    {
      this.loadDesign(persistentUri)

      let urlPath   = window.location.href + "?designUrl="+ persistentUri
      let pageTitle = "" 
      document.title = pageTitle
      window.history.pushState({"pageTitle":pageTitle},"", urlPath)
    }

    //last but not least, trie to load if anything is in the query (shorthand for design uuids)
    if(!singleDesign && !persistentUri && uriQuery)
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
      log.info("DONE",data)
      
      //FIXME: hack
      self.setState({
        design:{
          name: self.kernel.activeDesign.name,
          description:self.kernel.activeDesign.description,
          authors:self.kernel.activeDesign.authors || [],
          tags:self.kernel.activeDesign.tags || [],
          licenses:self.kernel.activeDesign.licenses || [],
          _persistentUri:self.state.design._persistentUri
        }
      })

      //FIXME: godawful hack because we have multiple "central states" for now
      self.kernel.activeAssembly.children.map(
        function(entityInstance){
          self.addEntityInstance(entityInstance)
        }
      )
      self._tempForceDataUpdate()
    }

    this.kernel.loadDesign(uri,options)
      .subscribe( logNext, logError, onDone)
  }


  
  //-------COMMANDS OR SOMETHING LIKE THEM -----

  setDesignData(data){
    log.info("setting design data", data)

    let design = Object.assign({}, this.state.design, data)
    this.setState({
      design:design
    })
    return design
  }

  setEntityData(data){
    log.info("setting entity data", data)

    if(!data) return

    let entity = data.entity
    let _entitiesById = this.state._entitiesById
    let tgtEntity     = _entitiesById[entity.iuid]
    delete data.entity

    for(let key in data){
      console.log("change", key)
      tgtEntity[key] = data[key]
    }
   

    if(!tgtEntity) return
    //tgtEntity. = color

    //FIXME : not sure
    let assemblyChildren = []
    for(let key in _entitiesById) {
      let value = _entitiesById[key]
      assemblyChildren.push( value )
    }
    this.setState({
      assemblies_main_children:assemblyChildren,
      _entitiesById:_entitiesById
    })

  }

  //FIXME this should be a command or something
  selectEntities(entities){
    log.info("selecting entitites",entities)
    let entities = entities || []
    if(entities.constructor !== Array) entities = [entities]

    let ids = entities.map( entity => entity.iuid)

    //if(ids !== this.state.selectedEntitiesIds){
    //TODO: should it be serialized in history ?
      this.setState({
        selectedEntities:entities,
        selectedEntitiesIds:ids
      }, null, false) 
    
    this._tempForceDataUpdate()
    return entities
  }

  
  //FIXME this should be a command or something

  /*register a new entity type*/
  addEntityType( type, typeUid ){
    log.info("adding entity type", type)
    let nKlasses  = this.state._entityKlasses
    nKlasses[typeUid] = type
    //nKlasses.push( type )

    //TODO: should it be part of the app's history 
    this.setState({_entityKlasses:nKlasses}, null, false)
  }

  //FIXME this should be a command or something
  /*save a new entity instance*/
  addEntityInstance( instance ){
    log.info("adding entity instance", instance)
    let nEntities  = this.state.assemblies_main_children
    nEntities.push( instance )

    let _entitiesById = this.state._entitiesById
    _entitiesById[instance.iuid] = instance

    this.setState({
      _entitiesById:_entitiesById,
      assemblies_main_children:nEntities
    })
  }

  addEntityInstanceTo( instance , parent){
    let parent = parent || null

  }

  /*remove an entity : it actually only 
  removes it from the active assembly*/
  removeEntityInstances( instances ){
    log.info("removing entity instances", instances)
    let self = this
    instances.map(function(instance){
      self.kernel.removeEntity(instance)
    })

    //FIXME: not sure...., duplication of the above again
    let nEntities  = this.state.assemblies_main_children
    let _tmp = instances.map(entity=>entity.iuid)
    let outNEntities = nEntities.map(entity=>entity.iuid).filter(function(iuid){ return _tmp.indexOf(iuid)===-1})

    this.setState({
      assemblies_main_children:outNEntities
    })   
  }

  /*duplicate all given instances of entities*/
  duplicateEntities( instances ){
    log.info("duplicating entity instances", instances)
    let self  = this
    let dupes = []

    instances.map(function(instance){
      let duplicate = self.kernel.duplicateEntity(instance)
      dupes.push( duplicate )
      //FIXME: this is redundant  
      self.addEntityInstance(duplicate)
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
      self.addEntityType( partKlass, typeUid )

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
    let self     = this
    let kernel   = this.kernel
    let glview   = this.refs.glview
    let assembly = this.kernel.activeAssembly
    let entries  = this.state.assemblies_main_children
    
    let selectedEntities = this.state.selectedEntitiesIds.map(entityId => self.state._entitiesById[entityId])
    let selectedEntitiesIds = this.state.selectedEntitiesIds

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

        log.debug("meshInstanceRXJS",mesh, entity)

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

    //FIXME: hack / experiment
    let annotationsData = [
        {
          iuid:"dfsdfsdf",
          type:"distance",
          distance : 150,
          start:{
            point :[0,1,0],
            entity: "A41A9D9E-E371-439B-A83B-A387DDD51FC1"
          },
          end:{
            point: [2,5,7],
            entity: "E83B5655-8B70-498D-B082-E502B8728CC6"
          }
        }
    ]
  

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
    let selectedEntities = this.state.selectedEntitiesIds
      .map(entityId => self.state._entitiesById[entityId])
      .filter(id => id!==undefined)

    //console.log("persistent",this.state._persistent)
    return (
        <div ref="wrapper" style={wrapperStyle} className="Jam">
          <MainToolbar 
            design={this.state.design} 
            appInfos={this.state.appInfos} 
            persistent={this.state._persistent}
            undos = {this._undos}
            redos = {this._redos}
            style={toolbarStyle}> </MainToolbar>

          <ThreeJs ref="glview"/>

          <div ref="testArea" style={testAreaStyle} className="toolBarBottom">
            <EntityInfos entities={selectedEntities} debug={false}/>
          </div>

          <ContextMenu settings={contextmenuSettings} />

        </div>
    )
  }
}
