import React from 'react';
import co from "co";


import ThreeJs     from './components/webgl/three-js.react'
import MainToolbar from './components/MainToolbar'
import EntityInfos from './components/EntityInfos'


import postProcessMesh from './meshpp/postProcessMesh'
import helpers         from 'glView-helpers'
let centerMesh         = helpers.mesthTools.centerMesh;

import AssetManager from 'usco-assetmanager'
import DesktopStore from 'usco-desktop-store'
import XhrStore     from 'usco-xhr-store'
import StlParser    from 'usco-stl-parser'
import CtmParser    from 'usco-ctm-parser'
import PlyParser    from 'usco-ply-parser'
/*import AMfParser    from 'usco-amf-parser'
import ObjParser    from 'usco-obj-parser'*/
//import registerReact from 'reactive-elements';

import Kernel       from 'usco-kernel2'


import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent;
let Observable = Rx.Observable;


import {partitionMin} from './coms/utils'


import DndBehaviour           from './behaviours/dndBe'

import keymaster from 'keymaster'


import logger from './utils/log'
let log = logger("Jam-Root");
log.setLevel("info");




export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      appInfos:{
        ns:"youmagineJam",
        name:"Jam!",
        version:"0.0.0"
      },
      settings:{//TODO: each component should "register its settings"
        grid:{
          show:false,
          size:"",
        },
        bom:{
          show:false,//this belongs in the bom system
        },
         annotations:{
          show:false,
        }
      },
      shortcuts:{
        'duplicateEntity':'⌘+r,ctrl+d',
        'removeEntity':'delete',
        'toTranslateMode':'m',
        'toRotateMode':'r',
        'toScaleMode':'s'
      },

      //real state 
      camActive : false,//is a camera movement taking place ?
      activeTool: null,
      design:{
        title:"untitled design",
        description:"",
      },
      selectedEntities:[]
    };

    this.assetManager = new AssetManager();
    this.assetManager.addParser("stl", new StlParser());
    this.assetManager.addParser("ctm", new CtmParser());
    this.assetManager.addParser("ply", new PlyParser());

    this.assetManager.addStore( "desktop", new DesktopStore() );
    this.assetManager.addStore( "xhr"    , new XhrStore() );

    this.kernel = new Kernel(this.state);
    this.kernel.setState = this.setState.bind(this);
  }
  
  componentDidMount(){
    var pjson = require('../package.json');
    this.setState(
    {
      appInfos:{
        ns : this.state.appInfos.ns,
        name: this.state.appInfos.name,
        version:pjson.version
      }  
    });

    //add drag & drop behaviour 
    let container = this.refs.wrapper.getDOMNode();
    DndBehaviour.attach( container );
    DndBehaviour.dropHandler = this.dropHandler.bind(this);

    let glview   = this.refs.glview;
    let meshesCh = glview.selectedMeshesCh;
    let self     = this;

    //get entities 
    let checkCount = function(x){
      return (x.length>0)
    }

    let filterEntities = function( x ){
      log.info("x",x)
      return (x.userData && x.userData.entity)
    }

    let fetchEntities = function( x ){
      log.info("x",x)
      return x.userData.entity;
    }

    let foo = function(x){
       console.log("here",x)
       return x;
    }
    let finalLog=function(x){
       console.log("FINAL",x)
       return x;
    }

    let selectedMeshesChAlt = glview.selectedMeshesSub;
    //selectedMeshesChAlt.subscribe(foo);

    let truc = selectedMeshesChAlt
      .defaultIfEmpty([])
      .map(
        function(selections){
          let res= selections.filter(filterEntities).map(fetchEntities);
          self.setSeletedEntites(res)
        }
      );

      //.filter(filterEntities)
      //.map(fetchEntities);
      //.flatMap( x => x )
      
      /*.distinct()
      */

    //truc.subscribe(foo)

    //let trac = Observable.return([])

    //let yeah = trac.merge(truc);//.skipUntil(selectedMeshesChAlt)

    truc.subscribe(finalLog);

    //truc.merge(trac).skipUntil(bla).map(foo)

    //selectedMeshesChAlt
      //.distinctUntilChanged()
      //.flatMap( x => x )
      //.map(foo)
      /*
      //
      .map(fetchEntities)
      .map(function(selectedEntities){
      //always return array
      console.log("here",selectedEntities)
      self.setSeletedEntites(selectedEntities)
    })*/

    /*var subscription = yeah.subscribe(
      function (x) {
          console.log("selectedEntities", x);

      },
      function (err) {
          console.log('Error: ' + err);
      },
      function () {
          console.log('Completed');
      });*/



    //setup key bindings
    this.setupKeyboard()
    this.setupMouseTrack()
  }

  componentWillUnmount(){
    DndBehaviour.detach( );
  }

  //event handlers
  setupKeyboard(){
    //non settable shortcuts
    //prevent backspace
    keymaster('backspace', function(){ 
      return false
    });
    keymaster('F11', function(){ 
      //self.handleFullScreen();
    });
    keymaster('⌘+z,ctrl+z', function(){ 
      //self.undo();
    });
    keymaster('⌘+shift+z,ctrl+shift+z', function(){ 
      //self.redo();
    });

    //deal with all shortcuts
    let shortcuts = this.state.shortcuts;
    for(let actionName in shortcuts){
      let keys = shortcuts[actionName]
      keymaster(keys, function(){ 
        console.log(`will do ${actionName}`)
        return false;
      });
    }

    /*
      //self.removeEntity();
      //self.duplicateEntity();
      //self.toTranslateMode();
      //self.toRotateMode();
      //self.toScaleMode();
    */
  }

  unsetKeyboard(){
    //keymaster.unbind('esc', this.onClose)
  }

  dropHandler(data){
    log.info("data was dropped into jam!", data)
    for (var i = 0, f; f = data.data[i]; i++) {
        this.loadMesh( f, {display: true} );
    }
  }
  doubleTapHandler( event ){
    var pickingInfos = event.detail.pickingInfos;
    if(!pickingInfos) return;
    if(pickingInfos.length == 0) return;
    var object = pickingInfos[0].object; 
    //console.log("object double tapped", object);
    this._zoomInOnObject.execute( object, {position:pickingInfos[0].point} );
  }

  setupMouseTrack(trackerEl, outputEl){
    log.info("")
  }

  //FIXME: move this into assetManager
  dismissResource(resource){
    resource.deferred.reject("cancelling");
    this.assetManager.unLoad( resource.uri )
  }

  //FIXME; this should be a command or something
  setSeletedEntites(selectedEntities){
    let selectedEntities = selectedEntities || [];
    if(selectedEntities.constructor !== Array) selectedEntities = [selectedEntities]
    this.setState({
      selectedEntities:selectedEntities
    });
    log.info("selectedEntities",selectedEntities)
  }

  loadMesh( uriOrData, options ){
    const DEFAULTS={
    }
    var options     = options || {};
    var display     = options.display === undefined ? true: options.display;
    var addToAssembly= options.addToAssembly === undefined ? true: options.addToAssembly;
    var keepRawData = options.keepRawData === undefined ? true: options.keepRawData;
    
    if(!uriOrData) throw new Error("no uri or data to load!");

    let self = this;
    let resource = this.assetManager.load( uriOrData, {keepRawData:true, parsing:{useWorker:true,useBuffers:true} } );

    var source = Rx.Observable.fromPromise(resource.deferred.promise);

    let logNext  = function( next ){
      log.info( next )
    }
    let logError = function( err){
      log.error(err)
    }
    let handleLoadError = function( err ){
       log.error("failed to load resource", err, resource.error);
       //do not keep error message on screen for too long, remove it after a while
       setTimeout(cleanupResource, self.dismissalTimeOnError);
       return resource;
    }
    let cleanupResource = function( resource ){
      log.info("cleaning up resources")
      self.dismissResource(resource);
    }

    let register = function( shape ){
      //part type registration etc
      //we are registering a yet-uknown Part's type, getting back an instance of that type
      let partKlass    = self.kernel.registerPartType( null, null, shape, {name:resource.name, resource:resource} );
      let partInstance = undefined;
      if( addToAssembly ) {
        partInstance = self.kernel.makePartTypeInstance( partKlass );
        self.kernel.registerPartInstance( partInstance );
      }

      //we do not return the shape since that becomes the "reference shape", not the
      //one that will be shown
      return {klass:partKlass,instance:partInstance};
    }

    let showIt = function( klassAndInstance ){
      if( display || addToAssembly ){
        //klassAndInstance.instance._selected = true;//SETTIN STATE !! not good like this
        self._tempForceDataUpdate();
      }
      return klassAndInstance
    }

    let mainProc = source
      .map( postProcessMesh )
      .map( centerMesh )
      .share();

    /*mainProc.map( register ).subscribe(logNext,logError);
    mainProc.map( showIt ).subscribe(logNext,logError);*/
    mainProc
      .map( register )
      .map( showIt )
      .map( function(klassAndInstance){
        klassAndInstance.instance.pos[2]+=30;
        return klassAndInstance;
      })
        .catch(handleLoadError)
        //.timeout(100,cleanupResource)
        .subscribe(logNext,logError);

    mainProc.subscribe(logNext,logError);
  }

  //mesh insertion post process
  //FIXME: do this better , but where ?
  _meshInjectPostProcess( mesh ){
    //FIXME: not sure about these, they are used for selection levels
    mesh.selectable      = true;
    mesh.selectTrickleUp = false;
    mesh.transformable   = true;
    //FIXME: not sure, these are very specific for visuals
    mesh.castShadow      = true;
    //mesh.receiveShadow = true;
    //FIXME: not sure where this should be best: used to dispatch "scene insertion"/creation operation
    //var operation = new MeshAddition( mesh );
    //self.historyManager.addCommand( operation );
  }


  /*temporary method to force 3d view updates*/
  _tempForceDataUpdate(){
    let glview   = this.refs.glview;
    let assembly = this.kernel.activeAssembly;
    let entries  = assembly.children;

    let mapper = function( entity, addTo, xform ){
      let self = this;

      /*let getInstance  = self.kernel.getPartMeshInstance( entity );
      return Rx.Observable.from( getInstance )
        .map(function(meshInstance){
          meshInstance.userData.entity = entity;//FIXME : should we have this sort of backlink ?
          //FIXME/ make a list of all operations needed to be applied on part meshes
          //computeObject3DBoundingSphere( meshInstance, true );
          //centerMesh( meshInstance ); //FIXME do not use the "global" centerMesh
          
          log.info("instance",meshInstance)

          meshInstance.position.fromArray( entity.pos )
          meshInstance.rotation.fromArray( entity.rot );
          meshInstance.scale.fromArray(  entity.sca );
          if (addTo)addTo.add( meshInstance);
          if (xform) xform(entity,meshInstance);
          return meshInstance
        })
        .map(self._meshInjectPostProcess)*/

      co(function* (){
        let meshInstance = yield self.kernel.getPartMeshInstance( entity ) ;
        console.log("meshInstance",meshInstance)
        if( meshInstance){
          meshInstance.userData.entity = entity;//FIXME : should we have this sort of backlink ?
          //FIXME/ make a list of all operations needed to be applied on part meshes
          //computeObject3DBoundingSphere( meshInstance, true );
          //centerMesh( meshInstance ); //FIXME do not use the "global" centerMesh
          
          log.info("instance",meshInstance)

          meshInstance.position.fromArray( entity.pos )
          meshInstance.rotation.fromArray( entity.rot );
          meshInstance.scale.fromArray(  entity.sca );

          self._meshInjectPostProcess( meshInstance );
          
          if (addTo)addTo.add( meshInstance);
          if (xform) xform(entity,meshInstance);
          
          return meshInstance;
        }
      });
    };

    glview.forceUpdate(entries, mapper.bind(this));
  }

  selectedMeshesChangedHandler( selectedMeshes ){
    //console.log("selectedMeshes",selectedMeshes)
    let kernel = this.kernel;
    let selectedEntities = selectedMeshes.map( mesh => {
        return kernel.getEntityOfMesh( mesh )
      }
    );
    //console.log("selectedEntities",selectedEntities)
  }
  
  render() {

    let wrapperStyle = {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom:0,
      right:0,
      width:'100%',
      height:'100%'
    }
    let infoLayerStyle = {
      color: 'red',
      width:'300px',
      height:'300px',
      zIndex:15,
      position: 'absolute',
      left: 0,
      top: 0,
    };

    let titleStyle = {
      position: 'absolute',
      left: '50%',
      top: 0,
    }
    let testAreaStyle = {
      position: 'absolute',
      left: 0,
      bottom: 0,
    };

    //let fullTitle = `${this.state.design.title} ---- ${this.state.appInfos.name} v  ${this.state.appInfos.version}`;
    /*
       <div ref="title" style={titleStyle} > {fullTitle} </div>
          <ThreeJs testProp={this.state.test} cubeRot={this.state.cube} ref="glview"
          
          <div ref="infoLayer" style={infoLayerStyle} />*/
                      //<button onClick={this.handleClick.bind(this)}> Test </button>

    return (
        <div ref="wrapper" style={wrapperStyle}>
          <MainToolbar design={this.state.design} appInfos={this.state.appInfos}> </MainToolbar>
          <ThreeJs ref="glview"/>

          <div ref="testArea" style={testAreaStyle}>
            <EntityInfos entities={this.state.selectedEntities}/>
          </div>
        </div>
    );
  }
}
