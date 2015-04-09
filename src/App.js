import React from 'react';
import co from 'co';

import ThreeJs from './webgl/three-js.react.js';
import postProcessMesh from './meshpp/postProcessMesh'

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


import cstpTest from './coms/csp-test'
import {bufferWithTimeOrCount, fromDomEvent, MouseDrags} from './coms/interactions'

var csp = require("js-csp");
let {chan, go, take, put,putAsync, alts, timeout} = require("js-csp");
var xducers = require("transducers.js");
var seq = xducers.seq
var transduce = xducers.transduce
var reduce    = xducers.reduce

let pipeline = csp.operations.pipeline;
let merge    = csp.operations.merge;

import Firebase from 'firebase'

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
      camActive : false,//is a camera movement taking place ?
      activeTool: null,
      design:{
        title:"untitled design"
      }
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

    /*let glview   = this.refs.glview;
    DoubleClickBehaviour.attach( glview);
    DoubleClickBehaviour.dClickHandler = this.doubleTapHandler.bind(this);*/
    let glview   = this.refs.glview;
    let meshesCh = glview.selectedMeshesCh;
    
    /*let xform = xducers.compose(
        xducers.keep(),
        xducers.dedupe()
    );

    pipeline( meshesCh, xform, meshesCh );

    go(function*() {
      let prevMeshes;
      while(true) {
        var result = yield meshesCh;
        console.log("I got meshes",result);
        //console.log(prevMeshes)
        prevMeshes = result;
      }
    });*/

    //get entities 
    let checkCount = function(x){
      return (x.length>0)
    }

    let filterEntities = function( x ){
      return (x.userData && x.userData.entity)
    }

    let fetchEntities = function( x ){
      return x.userData.entity;
    }


    let meshesCh2 = glview.selectedMeshesCh;
    let xform = xducers.compose(
      xducers.filter( checkCount )//x => x.length>0)
      //xducers.partition(2)
    );

    let xTractEntities = xducers.compose(
        xducers.keep(),
        xducers.dedupe(),
        xducers.filter( filterEntities), //(x => x.userData && x.userData.entity ),
        xducers.map( fetchEntities )//x => x.userData.entity )
    );
    //pipeline( meshesCh2, xform, meshesCh2 );

    this.selectedEntities = [];
    let self = this;

    go(function*() {
      let prevSelections = []
      while(true) {
        var result = yield meshesCh2;
        let res  = seq(result,xTractEntities )
        

        prevSelections.map(function(entity){
          entity._selected = false;
        })

        res.map(function(entity){
          entity._selected = true;
        })
        self.selectedEntities = res;

        if( res.length >0 || prevSelections.length>0){
          console.log("I got entities",res)
          self._tempForceDataUpdate();
        }  

        prevSelections = res || [];
      }
    });

    //setup key bindings
    this.setupKeyboard()
    this.cspMouseTrack()
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

  cspMouseTrack(trackerEl, outputEl){

    /*let trackerEl = this.refs.wrapper.getDOMNode();
    let outputEl  = this.refs.infoLayer.getDOMNode();

    let isTwoValues  = function( x ) { return (x.length == 2); }
    let isOneValue = function( x ) { return (x.length == 1); }

    let mouseUps    = fromDomEvent(trackerEl, 'mouseup');
    let mouseDowns  = fromDomEvent(trackerEl, 'mousedown');
    let mouseMoves  = fromDomEvent(trackerEl, 'mousemove');*/

    //mouseDowns = csp.operations.map( inc, mouseDowns, 1);
    /*pipeline(mouseUps,   xducers.map( x => false ), mouseUps);
    pipeline(mouseDowns, xducers.map( x => true ) , mouseDowns);

    let mouseStates = merge([mouseDowns,mouseUps]);
    let pointerHold = bufferWithTimeOrCount(mouseStates,600,2)
    pipeline( pointerHold, xducers.filter( x => (x===true) ), pointerHold );*/

    /*go(function*() {
      while(true) {
        var result = yield pointerHold;
        console.log("holdPointer",result)
      }
    });*/
    //


    let trackerEl = this.refs.drawCanvas.getDOMNode();
    let canvas = trackerEl;
    let _ref = new Firebase("https://boiling-heat-275.firebaseio.com/");

    /*
    let mouseUps    = fromDomEvent(trackerEl, 'mouseup');
    let mouseDowns  = fromDomEvent(trackerEl, 'mousedown');
    let mouseMoves  = fromDomEvent(trackerEl, 'mousemove');

    function coordinate(event, canvas) {
        let rect = canvas.getBoundingClientRect();

        let coords={
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        }
        console.log(coords)
        return coords
      }

   let mouseDrags = MouseDrags(mouseDowns, mouseUps, mouseMoves);
      // Saving to firebase 
      go(function*() {
        for (;;) {
          let drag = yield mouseDrags;
          //console.log("drag",drag)
          go(function*() {
            let color = "blue";//document.getElementById("color").value || "blue";
            //let _dragref = _ref.push({color: color});
            let event;
            while (csp.CLOSED !== (event = yield drag)) {
              console.log("drag indeed")
              //_dragref.ref().child("points").push(coordinate(event, canvas));
            }
          });
        }
      });

      */

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
    
    co(function* (){

      try{
        let meshData = yield resource.deferred.promise;
        let shape = postProcessMesh( resource )

        //part type registration etc
        //we are registering a yet-uknown Part's type, getting back an instance of that type
        let partKlass = self.kernel.registerPartType( null, null, shape, {name:resource.name, resource:resource} );
        if( addToAssembly ) {
          let part = self.kernel.makePartTypeInstance( partKlass );
          self.kernel.registerPartInstance( part );
        }
        
        if( display || addToAssembly ){
          //self.refs.glview.scene.add( shape );
          self._meshInjectPostProcess( shape );
          //self.selectedEntities = [ shape.userData.entity ];
          self._tempForceDataUpdate();
        }
      }catch( error ){
        console.log("failed to load resource", error, resource.error);
        //do not keep error message on screen for too long, remove it after a while
        /*self.async(function() {
          self.dismissResource(resource);
        }, null, self.dismissalTimeOnError);*/
      }
      
    })
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

  handleClick(){
    //console.log( this.state )
  }

  _tempForceDataUpdate(){
    let glview   = this.refs.glview;
    let assembly = this.kernel.activeAssembly;
    let entries  = assembly.children;

    let mapper = function( entity, addTo, xform ){
      let self = this;
      co(function* (){
        let meshInstance = yield self.kernel.getPartMeshInstance( entity ) ;
        console.log("meshInstance",meshInstance)
        if( meshInstance){
          meshInstance.userData.entity = entity;//FIXME : should we have this sort of backlink ?
          //FIXME/ make a list of all operations needed to be applied on part meshes
          //computeObject3DBoundingSphere( meshInstance, true );
          //centerMesh( meshInstance ); //FIXME do not use the "global" centerMesh
          
          meshInstance.position.fromArray( entity.pos )
          meshInstance.rotation.fromArray( entity.rot );
          meshInstance.scale.fromArray(  entity.sca );
          
          if (addTo)addTo.add( meshInstance);
          if (xform) xform(entity,meshInstance);
          self._meshInjectPostProcess( meshInstance );

          return meshInstance;
          //self._meshInjectPostProcess( meshInstance );
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
    let canvasStyle= {
      position: 'absolute',
      right: 0,
      bottom: 0,
      background: 'red',
      width:'300px',
      height:'300px',
      zIndex:25
    };
    //console.log(this.state);

    let fullTitle = `${this.state.design.title} ---- ${this.state.appInfos.name} v  ${this.state.appInfos.version}`;


    return (
        <div ref="wrapper">
          <div ref="title" style={titleStyle} > {fullTitle} </div>
          <ThreeJs testProp={this.state.test} cubeRot={this.state.cube} ref="glview"
          />
          <div ref="infoLayer" style={infoLayerStyle} />
          <div ref="testArea" style={testAreaStyle}>
            <button onClick={this.handleClick.bind(this)}> Test </button>
          </div>
          <div style={canvasStyle}>
            <canvas ref="drawCanvas"> </canvas>
          </div>
     
        </div>
    );
  }
}
