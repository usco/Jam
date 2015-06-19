require("./app.css")
import React from 'react'
import Class from "classnames"

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
import combineTemplate from 'rx.observable.combinetemplate'

import {fetchUriParams,getUriQuery,setWindowPathAndTitle}  from './utils/urlUtils'
import {first,toggleCursor,getEntity,hasEntity,extractMeshTransforms} from './utils/otherUtils'
import {clearCursor} from './utils/uiUtils'
import {generateUUID} from 'usco-kernel2/src/utils'

import screenfull from 'screenfull'
import keymaster from 'keymaster'

import logger from './utils/log'
let log = logger("Jam-Root")
log.setLevel("info")

import state from './state'

import BomView from './components/Bom/BomView'
import SettingsView from './components/SettingsView'
import ContextMenu from './components/ContextMenu'


////TESTING
import {selectEntities$,addEntityInstances$, setEntityData$, deleteEntities$, duplicateEntities$, deleteAllEntities$ } from './actions/entityActions'
import {setToTranslateMode$, setToRotateMode$, setToScaleMode$} from './actions/transformActions'
import {showContextMenu$, hideContextMenu$, undo$, redo$, setDesignAsPersistent$, clearActiveTool$,setSetting$} from './actions/appActions'
import {newDesign$, setDesignData$} from './actions/designActions'
import {toggleNote$,toggleThicknessAnnot$,toggleDistanceAnnot$, toggleDiameterAnnot$, toggleAngleAnnot$} from './actions/annotActions'
import {addBomEntries$, selectBomEntries$, selectBomEntries2$} from './actions/bomActions'

let commands = {
  "undo":undo$,
  "redo":redo$,

  "removeEntities":deleteEntities$,
  "duplicateEntities":duplicateEntities$,
  "toTranslateMode":setToTranslateMode$, 
  "toRotateMode": setToRotateMode$, 
  "toScaleMode":setToScaleMode$
}


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


export default class App extends React.Component {
  constructor(props){
    super(props)

    this.state = state

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
        //console.log("adding history", self._undos)
        self._undos.push( oldState)
        self._redos = []
      }
    } 

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
    let glview   = this.refs.glview
    
    ///////////
    //setup key bindings
    this.setupKeyboard()
    //experiment with rxjs
    /*let source = Rx.Observable.fromEvent(document, 'keydown')

      .map( e => e.altKey )
      .map( e => e.ctrlKey )
      .map( e => e.metaKey )
      
      .map( e => String.fromCharCode( e.which) )
      .scan(function(acc, newKey){

        return acc + newKey//.push(newKey)
      })
      .takeUntil(Rx.Observable.fromEvent(document, 'keyup'))
      .repeat()
      .subscribe(function(keys){
        console.log("keyEvent", keys )
      })*/
    ///////////

    /////////
    //FIXME: not so great, this should not be here
    //forced react state updaters
    function updateDesign(design){
      //console.log("updating design state")
      self.setState({
        design:design
      })
    }
    function updateEntities(entities){
      //console.log("updating entities state")
      self.setState({
        entities:entities
      })
    }
    function updateAppState(data){
      //console.log("updating app state",data)
        self.setState({
          appState:data
      },null,false)
    }
    function updateAnnotations(annotations){
      //console.log("updating annotations")
      self.setState({
        annotationsData:annotations
      })
    }
    function updateBom(bom){
      //hack, obviously
      self.setState({
        bom:bom
      })
    }
    ////////
    let design$ = require('./core/designModel')

    design$ = design$({
        newDesign$,
        setDesignData$,
        setAsPersistent$:setDesignAsPersistent$
      }
    )

    design$
      .distinctUntilChanged()//only do anything if there were changes
      .subscribe(function(data){    
        updateDesign(data)
        setTimeout(self._tempForceDataUpdate.bind(self), 10)
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
        localStorage.removeItem("jam!-settings")

        //remove meshes, resources etc
        self.assetManager.clearResources()
        self.kernel.clearAll()

        //clear window url etc
        setWindowPathAndTitle()
      })

    design$
      .pluck("uri")
      .distinctUntilChanged()
      .subscribe(function(designsUri){
        //console.log("designsUri changed",designsUri)
        //setWindowPathAndTitle("?designUrl="+ designsUri)
      })

    design$
      .pluck("name")
      .distinctUntilChanged()
      .subscribe(function(designName){
        window.document.title = `${designName} -- Jam!`
      })
    
    ///////////

    let entities$ = require("./core/entityModel")

    entities$ = entities$({
        createEntityInstance$:new Rx.Subject(),//createEntityInstance$,
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
        setTimeout(self._tempForceDataUpdate.bind(self), 10)
      })

        
    //////////
    let appState$ = require("./core/appModel.js")
    appState$ = appState$({
      setSetting$
    })

    appState$
      .subscribe(function(data){
        updateAppState(data)
        setTimeout(self._tempForceDataUpdate.bind(self), 10)
      })
   
    appState$
      .pluck("activeTool")
      .filter((x)=> x === undefined)
      .subscribe(clearCursor)

    //temp hack
    appState$
      .pluck("activeTool")
      //.filter(tool => ["translate","rotate","scale"].indexOf(tool)===-1)
      .subscribe(function (activeTool) {
        if(activeTool !== undefined){
          toggleCursor(true,"crosshair")
        }
      })

    //////////////

    let annotations$ = require("./core/annotationModel")

    annotations$ = annotations$({
        singleTaps$:glview.singleTaps$, 
        activeTool$:appState$.map(aS=>aS.activeTool),
        deleteAnnots$:deleteEntities$
      },
      self.state.annotationsData
    ).share()

    annotations$
      .subscribe(function (data){
        clearActiveTool$()
        updateAnnotations(data)
        setTimeout(self._tempForceDataUpdate.bind(self), 10)
      })
    
    ///////////////////
    //data sources
    let dataSources = require('./core/sources/dataSources').getDataSources
    let urlSources = require('./core/sources/urlSources')

    urlSources.appMode$.subscribe( appMode => setSetting$({path:"mode",value:appMode}) )
    urlSources.settings$.subscribe(function(settings){
      console.log("settings from old",settings)
      const defaults = {
        persistent:false,
        lastDesignUri:undefined,
        lastDesignName:undefined,

        /*grid:{
          show:false,
        },
        annotations{
          show:false
        }*/
      }
      let _settings = Object.assign({},defaults,settings)

      setDesignData$({
        _persistent:_settings.persistent,
        uri:_settings.lastDesignUri,
        name:_settings.lastDesignName
      })

      //setSetting$({path:"grid.show",value:_settings.grid.show})
      //setSetting$({path:"grid.show",value:_settings.grid.show})
    })

    let {meshSources$, designSources$} = dataSources(container, urlSources)

    //experimental 
    let res$ = meshSources$
      .flatMap(function(dataSource){
        let resource = self.assetManager.load( dataSource, {keepRawData:true, parsing:{useWorker:true,useBuffers:true} } )
        return Rx.Observable.fromPromise(resource.deferred.promise)
      })
      .shareReplay(1)

    //mesh + resource data together
    let combos$ =
      res$.map(function(resource){
        let mesh = postProcessMesh(resource)
        mesh=centerMesh(mesh)
        return {mesh, resource}
      })
      .shareReplay(1)

    //stream of processed meshes
    /*let meshes$ = res$
      .map( postProcessMesh )
      .map( centerMesh )

    //mesh + resource data together
    let combos$ = meshes$
      .zip(res$, function(mesh,resource){
        return {mesh,resource}
      })
      .shareReplay(1)*/
    
    //register meshes <=> types
    let partTypes$ = require('./core/partReg')
    partTypes$ = partTypes$({combos$:combos$})

    //register meshes <=> bom entries
    let bom$ = require('./core/bomReg')
    bom$ = bom$({
      addBomEntries$:addBomEntries$,
      combos$:combos$,
      partTypes$:partTypes$,
      entities$:entities$,
      selectBomEntries$:selectBomEntries$,
      selectBomEntries2$:selectBomEntries2$
    })

    bom$.subscribe(function(bom){
      updateBom(bom)
    })

    Array.prototype.flatMap = function(lambda) { 
      return Array.prototype.concat.apply([], this.map(lambda)) 
    }

 
    //this one takes care of adding templatemeshes
    combos$
      .zip(partTypes$.skip(1).map( x=>x.latest ),function(cb, typeUid){
        self.kernel.partRegistry.addTemplateMeshForPartType( cb.mesh.clone(), typeUid )
      })
      .subscribe(function(data){
        console.log("templatemeshes",data)
      })

    //we observe changes to partTypes to add new instances
    //note : this should only be the case if we have either
    //draged meshed, or got meshes from urls
    //OR we must use data from our entities "model"
    partTypes$
      .skip(1)
      .withLatestFrom(entities$,function(partTypes, entities){

        let idx = Object.keys(entities.entitiesById).length
        let typeUid = partTypes.latest
        let name = partTypes.typeUidToMeshName[typeUid]+idx
        let bbox = partTypes.typeData[typeUid].bbox
        
        return {name, typeUid, bbox}
      })
      .subscribe(
        function(data){
        console.log("updated mesh registry, adding instance",data)

        //FIXME: hack "centerMesh" like method, as centerMesh centers a mesh that gets "discarded" in a way
        let h = data.bbox.max[2]  - data.bbox.min[2]

        let partInstance =
        {
            name: data.name,
            iuid: generateUUID(),
            typeUid: data.typeUid,
            color: "#07a9ff",
            pos: [
                0,
                0,
                h/2
            ],
            rot: [
                0,
                0,
                0
            ],
            sca: [
                1,
                1,
                1
            ],
            bbox:data.bbox
        }

        addEntityInstances$(partInstance)
      })



    //interactions
    let inter = require('./core/intents.js')
    let intent = inter.Intent({
      objectsTransforms$ : glview.objectsTransform$,
      selectedMeshes$    : glview.selectedMeshes$,
      selectedBomEntries$: selectBomEntries$,

      //these indicate an issue, they should not need to be injected into an intent
      appState$: appState$,
      entities$:entities$,
      bom$:bom$,
    })

    intent.entityTransforms$
      .subscribe(setEntityData$)

    intent.entitiesToSelect$
      .subscribe( selectEntities$ )
      

    //sinks (saving etc )
    let sinks = require('./core/sinks')
    //sinks.serializer(self.kernel, design$, entities$, annotations$, bom$, combos$, setDesignData$)

    designSources$
      .subscribe(function(designUri){
        console.log("LOOOOAD hey , can you please load",designUri)

        let source = self.kernel.loadDesign(designUri)
        source.subscribe(function(bla){
          console.log("gnn",bla)
          
          setDesignData$(bla.design)
          addBomEntries$(bla.bom)
          addEntityInstances$(bla.assemblies.children)


          let meshData$ =bla.meshSources$
            .shareReplay(1)

          /*meshData$
            .subscribe( function(entry){
              console.log("mesh entry",entry)})*/

          let meshes$ =
            meshData$
            .pluck("uri")
            .flatMap(function(dataSource){
              let resource = self.assetManager.load( dataSource, {keepRawData:true, parsing:{useWorker:true,useBuffers:true} } )
              return Rx.Observable.fromPromise(resource.deferred.promise)
            })
            .map( postProcessMesh )
            .map( centerMesh )
          

          meshData$
            .zip(meshes$,function(meshData, mesh){
              self.kernel.partRegistry.addTemplateMeshForPartType( mesh.clone(), meshData.typeUid )
            })
            .subscribe((bla)=>{setTimeout(self._tempForceDataUpdate.bind(self), 10)})  

        })
      },(err)=>console.log("error",err))
    //////////////////////////////

    showContextMenu$
      .skipUntil(appState$.filter(appState=>appState.mode !=="viewer"))//no context menu in viewer mode
      /*.combineLatest(
        $entities.pluck("selectedEntitiesIds"),
        //$annotations.pluck("selectedAnnots"),
        function(event, entityIds){
          return {event, entityIds}
        }
      )*/
      .subscribe(function(event){

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

        /*  {name:"Distance",action:toggleDistanceAnnot$},
          {name:"Angle",action:toggleAngleAnnot$},*/
        {name:`Jam! version : ${self.state.appInfos.version}`,action:(()=>null)}
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
          position:event.position,
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

    console.log("---READY TO START JAM!---")
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
    let selectedEntitiesIds = this.state.entities.selectedEntitiesIds

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


    //hack hack hack
    function toggleFullScreen(){
      if (screenfull.enabled) {
        screenfull.toggle()
        self.setState({fullScreen:screenfull.isFullscreen},null,false)
      } else {
      }
    }

    let fullScreenTogglerImg = null

    if(!screenfull.isFullscreen)
    {
        fullScreenTogglerImg = (
          <svg version="1.1" id="Resize_full_screen" 
             x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" >
            <path d="M6.987,10.987l-2.931,3.031L2,11.589V18h6.387l-2.43-2.081l3.03-2.932L6.987,10.987z M11.613,2l2.43,2.081l-3.03,2.932l2,2
            l2.931-3.031L18,8.411V2H11.613z"/>
          </svg>
        )
    }else{
      fullScreenTogglerImg = (
          <svg version="1.1" id="Resize_100_x25_" xmlns="http://www.w3.org/2000/svg" 
            x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" >
            <path fill="#FFFFFF" d="M4.1,14.1L1,17l2,2l2.9-3.1L8,18v-6H2L4.1,14.1z M19,3l-2-2l-2.9,3.1L12,2v6h6l-2.1-2.1L19,3z"/>
          </svg>
        )
    }
    

    //BOM stuff
    let fieldNames = ["name","qty","unit","version"]
    let sortableFields = ["id","name","qty","unit"]
    let entries = this.state.bom.entries

    let bom = undefined
    if(this.state.appState.mode !== "viewer"){
      bom=  (
        <BomView ref="bom"
          fieldNames={fieldNames} 
          sortableFields={sortableFields}
          entries={entries} 
          selectedEntries={self.state.bom.selectedEntries}
          selectBomEntries$={selectBomEntries$}
          > 
        </BomView> 
      )
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
            showAnnotations={this.state.appState.annotations.show}
            gridSettings={this.state.appState.grid}
            cameraSettings={this.state.appState.camera}/> 

          <div ref="testArea" style={testAreaStyle} className="toolBarBottom">
            <EntityInfos 
              entities={selectedEntities} 
              mode={this.state.appState.mode}
              debug={false}
            />
          </div>

          <SettingsView settings={this.state.appState}></SettingsView>

          {bom}

          <ContextMenu settings={contextmenuSettings} />

          <button className="fullScreenToggler" onClick={toggleFullScreen}>
            {fullScreenTogglerImg}
          </button>

        </div>
    )
  }
}
