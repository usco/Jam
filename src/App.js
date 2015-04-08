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
import {bufferWithTimeOrCount} from './coms/interactions'

var csp = require("js-csp");
let {chan, go, take, put, alts, timeout} = require("js-csp");
var xducers = require("transducers.js");


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

    let keyMapper = function( name ){

      this.activeTool = this.activeTool === "rotate" ? null: "rotate";
    }
    
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

    let trackerEl = this.refs.wrapper.getDOMNode();
    let outputEl  = this.refs.infoLayer.getDOMNode();

    function listen(el, type, bufSize, xform) {
      var ch = chan(bufSize, xform);
      el.addEventListener(type, function(e) {
        csp.putAsync(ch, e);
      });
      return ch;
    }

    let isTwoValues  = function( x ) { return (x.length == 2); }
    let isOneValue = function( x ) { return (x.length == 1); }


    //

    /*go(function*() {
      var clickch = listen(trackerEl, 'click');
      var bufferedClicksCh  = bufferWithTimeOrCount(clickch, 250, 2)

      var testCh = csp.chan();
      var xform = xducers.filter(isOneValue);

      // Notice that we're keeping `toCh` open after `fromCh` is closed
      csp.operations.pipeline(testCh, xform, bufferedClicksCh, true);

      while(true) {
        var result = yield testCh;
        console.log("AAAAAAAA",result)//if(result.value) 
      }
    });*/
    let pipeline = csp.operations.pipeline;
    let merge    = csp.operations.merge;


    var tform = xducers.map( x => true );

    let mouseUpCh    = listen(trackerEl, 'mouseup');
    let mouseDownCh  = listen(trackerEl, 'mousedown');//, 1, tform);

    //mouseDownCh = csp.operations.map( inc, mouseDownCh, 1);
    pipeline(mouseUpCh,   xducers.map( x => false ), mouseUpCh);
    pipeline(mouseDownCh, xducers.map( x => true ) , mouseDownCh);

    let mouseStateCh = merge([mouseDownCh,mouseUpCh]);


    let pointerHold = bufferWithTimeOrCount(mouseStateCh,600,2)
    pipeline( pointerHold, xducers.filter( x => (x===true) ), pointerHold );
    

    go(function*() {
      while(true) {
        var result = yield pointerHold;
        console.log("holdPointer",result)
      }
    });


    /*go(function*() {
      var mousech = listen(trackerEl, 'mousemove');
   
      var clickch = listen(trackerEl, 'click');
      var mousePos = [0, 0];
      var clickPos = [0, 0];

      while(true) {
        var v = yield alts([mousech, clickch,timeout(500) ]);
        var e = v.value;
        let moved = false;//TODO: use a transducer to determine movement? ie diffs in position


        switch( v.channel ){
          case mousech:
            mousePos = [e.layerX || e.clientX, e.layerY || e.clientY];
          break;
          case clickch:
            clickPos = [e.layerX || e.clientX, e.layerY || e.clientY];
          break;
          case upch:
            console.log("mouse up");
          break;
          case downch:
            console.log("mouse down");
          break;
          default:
            //, timeout(500)
            console.log("duh, waitin'")
          break;
        }

        outputEl.innerHTML = (mousePos[0] + ', ' + mousePos[1] + ' — ' +
                        clickPos[0] + ', ' + clickPos[1]);
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
          self.refs.glview.scene.add( shape );
          self._meshInjectPostProcess( shape );
          //self.selectedEntities = [ shape.userData.entity ];
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
    console.log( this.state )
  }


  activeHierarchyStructureChanged(changes, self){
    console.log("changes in assembly", changes);// self._kernel.activeAssembly);
    
    //this needs to hook up into the api and current storage system
    self._kernel.saveActiveAssemblyState();
    
    //react to the changes, update visuals
    changes.map( function( change ){
      //get visuals for entities that were removed:
      var removedEntities = change.removed;
      var addedEntities   = [ change.object[ change.index ] ].filter(function(n){ return n != undefined });
      var changePath      = change.path;
      console.log("removedEntities", removedEntities,"addedEntities",addedEntities, "changePath",changePath);
      
      //remove the visuals of the removed entities
      removedEntities.map( function( entity ) {
        var meshInstance = self._kernel.getMeshOfEntity( entity );
        if( meshInstance && meshInstance.parent ){
          meshInstance.parent.remove( meshInstance );
        }
      });
      
      //add the visuals of the added entities
      addedEntities.map( function( entity ) {
        //FIXME: use methods, not specific data structures
        co(function* (){
          var meshInstance = yield self._kernel.getPartMeshInstance( entity ) ;
          meshInstance.userData.entity = entity;//FIXME : should we have this sort of backlink ?
          if( meshInstance){
            //FIXME/ make a list of all operations needed to be applied on part meshes
            computeObject3DBoundingSphere( meshInstance, true );
            centerMesh( meshInstance ); //FIXME do not use the "global" centerMesh
            
            meshInstance.position.fromArray( entity.pos )
            meshInstance.rotation.fromArray( entity.rot );
            meshInstance.scale.fromArray(  entity.sca );
            
            self.threeJs.scenes["main"].add( meshInstance );
            self._meshInjectPostProcess( meshInstance );
          }
        });
      });
    });

    /*let self = this;
    let mapper = function( entity ){
      let meshInstance = yield self._kernel.getPartMeshInstance( entity ) ;
      if( meshInstance){
        meshInstance.userData.entity = entity;//FIXME : should we have this sort of backlink ?
        //FIXME/ make a list of all operations needed to be applied on part meshes
        computeObject3DBoundingSphere( meshInstance, true );
        centerMesh( meshInstance ); //FIXME do not use the "global" centerMesh
        
        meshInstance.position.fromArray( entity.pos )
        meshInstance.rotation.fromArray( entity.rot );
        meshInstance.scale.fromArray(  entity.sca );
        
        self._meshInjectPostProcess( meshInstance );
      }
    }*/
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
    console.log(this.state);

    let fullTitle = `${this.state.design.title} ---- ${this.state.appInfos.name} v  ${this.state.appInfos.version}`;

    return (
        <div ref="wrapper">
          <div ref="title" style={titleStyle} > {fullTitle} </div>
          <ThreeJs testProp={this.state.test} cubeRot={this.state.cube} ref="glview"
            onSelectedMeshesChange={this.selectedMeshesChangedHandler.bind(this)}
          />
          <div ref="infoLayer" style={infoLayerStyle} />
          <div ref="testArea" style={testAreaStyle}>
            <button onClick={this.handleClick.bind(this)}> Test </button>
          </div>
        </div>
    );
  }
}
