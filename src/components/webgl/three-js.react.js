import React from 'react';
import THREE from 'three';
import TWEEN from 'tween.js'

import Detector from './deps/Detector.js';

import helpers from 'glView-helpers'
let LabeledGrid = helpers.grids.LabeledGrid;
let ShadowPlane = helpers.planes.ShadowPlane;
let CamViewControls= helpers.CamViewControls;


//import CanvasRenderer from './deps/CanvasRenderer';
import OrbitControls from './deps/OrbitControls';
import CombinedCamera from './deps/CombinedCamera';

import PreventScrollBehaviour from '../../behaviours/preventScrollBe'

//TODO: import this at another level, should not be part of the base gl view
import TransformControls from './transforms/TransformControls'
import Selector from './deps/Selector'
let OutlineObject = helpers.objectEffects.OutlineObject;
let ZoomInOnObject= helpers.objectEffects.ZoomInOnObject;



import Rx from 'rx'
let Observable= Rx.Observable;
let Subject   = Rx.Subject;


import {windowResizes,pointerInteractions} from '../../interactions/interactions'

import logger from '../../utils/log'
let log = logger("glView");
log.setLevel("info");


//FIXME: hack for now, should not be set here
import {setToTranslateMode, setToRotateMode, setToScaleMode} from "../../actions/transformActions"
//NOT so sure about these
import {showContextMenu, hideContextMenu} from '../../actions/appActions'


class ThreeJs extends React.Component{
  constructor(props){
    super(props);
    console.log("props", this.props);

    console.log("helpers",helpers)

    this.scenes = {};

    //shoud be props ?
    this.config = {
      renderer:{
        shadowMapEnabled:true,
        shadowMapAutoUpdate:true,
        shadowMapSoft:true,
        shadowMapType : THREE.PCFSoftShadowMap,//THREE.PCFSoftShadowMap,//PCFShadowMap; 
        autoUpdateScene : true,
        physicallyBasedShading : false,
        autoClear:true,
        gammaInput:false,
        gammaOutput:false
      },
      viewports:[
        {
          name:"bla",
        }
      ],
      cameras:[
        {
          name:"bla",
          pos:[75,60,145] ,//[100,-100,100],//72.31452486225086, y: 61.11051151952455, z: 145.03832209374463
          up:[0,0,1],
          lens:{
            fov:45,
            near:0.1,
            far:20000,
          }
        }
      ],
      controls:[
        {
          rotateSpeed:2.0,
          panSpeed:2.0,
          zoomSpeed:2.0,
          autoRotate:{
            enabled:false,
            speed:4.0
          },
          _enabled:true,
          _active:true,
        }
      ],
      scenes:{
        "main":[
          //{ type:"hemisphereLight", color:"#FFFF33", gndColor:"#FF9480", pos:[0, 0, 500], intensity:0.6 },
          { type:"hemisphereLight", color:"#FFEEEE", gndColor:"#FFFFEE", pos:[0, 1200, 1500], intensity:0.8 },
          { type:"ambientLight", color:"#0x252525", intensity:0.03 },
          { type:"directionalLight", color:"#262525", intensity:0.2 , pos:[150,150,1500], castShadow:true, onlyShadow:true}
          //{ type:"directionalLight", color:"#FFFFFF", intensity:0.2 , pos:[150,150,1500], castShadow:true, onlyShadow:true}
        ],
        "helpers":[
          {type:"LabeledGrid"}
        ]
      }
    };

    this.state={cameras : this.config.cameras };
  }
  
  componentDidMount(){
    let listen=function(value){
      console.log("listen",value);
      return value;
    }
    let errors = function(error){
      console.log("error",error)
    }

    this.scene = new THREE.Scene();
    this.dynamicInjector = new THREE.Object3D();//all dynamic mapped objects reside here
    this.scene.add( this.dynamicInjector );

    let renderer = null;
    
    if(!Detector.webgl){
      //Detector.addGetWebGLMessage();
      //renderer = new CanvasRenderer(); 
    } else {
      renderer = new THREE.WebGLRenderer( {antialias:true} );
    }
    renderer.setClearColor( 0xffffff );
    renderer.shadowMapEnabled = this.config.renderer.shadowMapEnabled;
    renderer.shadowMapAutoUpdate = this.config.renderer.shadowMapAutoUpdate;
    renderer.shadowMapSoft = this.config.renderer.shadowMapSoft;
    //renderer.shadowMapType = this.config.renderer.PCFSoftShadowMap;//THREE.PCFShadowMap; 
    //renderer.autoUpdateScene = this.config.renderer.autoUpdateScene;
    //renderer.physicallyBasedShading = this.config.renderer.physicallyBasedShading;
    //renderer.autoClear = this.config.renderer.autoClear;
    renderer.gammaInput = this.config.renderer.gammaInput;
    renderer.gammaOutput = this.config.renderer.gammaOutput;

    let camera  = this._makeCamera(this.config.cameras[0]);
    this.camera = camera ;
    this.scene.add( camera );
    camera.lookAt(this.scene.position); 
    
    let container = this.refs.container.getDOMNode();
    container.appendChild( renderer.domElement );
    this.container = container;
    
    this._makeControls(this.config.controls[0]);
    this.transformControls = new TransformControls(this.camera,renderer.domElement);
    this.scene.add( this.transformControls );

    for( let light of this.config.scenes["main"])
    {
      this._makeLight( light );
    }
    //TODO: for testing, remove
    //this._makeTestStuff();
    let grid = new LabeledGrid(200,200,10,this.config.cameras[0].up);
    //this.scene.add(grid);

    let shadowPlane = new ShadowPlane(2000,2000,null,this.config.cameras[0].up);
    this.scene.add(shadowPlane);

    ////////camera view controls
    let camViewRenderer = new THREE.WebGLRenderer( {antialias:true, alpha: true} );
    camViewRenderer.setSize( 256, 128 );

    camViewRenderer.setClearColor( 0x000000,0 );
     
    let camViewContainer = this.refs.camViewControls.getDOMNode();
    camViewContainer.appendChild( camViewRenderer.domElement );

    this.camViewScene = new THREE.Scene();

    //1:5 ratio to the main camera position seems ok
    let camPos = this.camera.position.clone().divideScalar(5).toArray();
    //camPos[2] = -camPos[2]

    let camViewCamConfig = {
        //width:256,
        //height:128,
        pos:camPos,
        up:[0,0,1]
    }
    

    let camViewCam   = this._makeCamera(camViewCamConfig);
    
    //camViewCam.toDiagonalView();
    //camViewCam.toOrthographic();
    camViewCam.aspect = 1;
    camViewCam.updateProjectionMatrix();
    camViewCam.lookAt(this.camViewScene.position); 

    let camViewControls = new CamViewControls({size:9, cornerWidth:1.5,highlightColor:"#ffd200",opacity:0.95},[this.camera,camViewCam])
    camViewControls.init( camViewCam, camViewContainer );
    this.camViewScene.add(camViewControls);

    this.camViewCam      = camViewCam;
    this.camViewControls = camViewControls;
    this.camViewRenderer = camViewRenderer;
    this.controls.addObject( camViewCam, {userZoom:false, userPan:false});
    //planesColor:"#17a9f5",edgesColor:"#17a9f5",cornersColor:"#17a9f5",

    let self = this;

    this.renderer = renderer;
    this._animate();

    this.selector = new Selector();
    this.selector.camera = this.camera;

    ///////////:setup ui interactions
    this.resizer = windowResizes(1);

    let handleResize = function(sizeInfos){
      console.log("setting size",sizeInfos);
      let {width,height,aspect} = sizeInfos;
    
      this.width  = width;
      this.height = height;
      let camera = this.camera;
      let renderer = this.renderer;

      //camera.aspect = 1;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize( width, height );
      self._render();
    }

    handleResize = handleResize.bind(this);


    this.resizer.subscribe( handleResize.bind(this) );
    //set the inital size correctly
    handleResize({width:window.innerWidth,height:window.innerHeight,aspect:0})
    //subscribe(listen)

    //setup INTERACTIONS
    let selectionAt = this._getSelectionsAt.bind(this);
    function coordsFromEvent(event){return {x:event.x, y:event.y}}
    function positionFromCoords(coords){return{position:{x:coords.x,y:coords.y},event:coords}}
    //function extractField(input, "fieldName")
    function getPickingObjectAndPoint(pickingInfo){
      
      return {object: pickingInfo.object,position:pickingInfo.point}
    } 


    
    //filters
    function arePickingInfos(event){ return (event.detail.pickingInfos && event.detail.pickingInfos.length >0);}
    function exists(data){ return data;}


    this.pointerInteractions = pointerInteractions(container);

    let {singleTaps$, doubleTaps$, contextTaps$, 
      dragMoves$, zoomIntents$} =  this.pointerInteractions;

    singleTaps$.map( selectionAt ).subscribe( this.handleTap.bind(this) );
    doubleTaps$.map( selectionAt ).subscribe( this.handleDoubleTap.bind(this) );

    //handle context menu type interactions
    contextTaps$.map( selectionAt )
      .map(this.selectMeshes.bind(this))
      .map( positionFromCoords )
      .subscribe( showContextMenu );


    let extractObject = function(event){ return event.target.object}
    let objectsTransforms = Observable.fromEvent(this.transformControls, 'objectChange')
      .map(extractObject);

    this.objectsTransform$ = objectsTransforms;
    //TODO: , create an abstraction above channels/rx
    this.selectedMeshes$   = new Rx.Subject();    

    //hande all the cases where events require re-rendering
    let controlsChanges$       = Observable.fromEvent(this.controls,'change');
    let objectControlChanges$  = Observable.fromEvent(this.transformControls,'change');
    let camViewControlChanges$ = Observable.fromEvent(this.camViewControls,'change');

    Observable.merge(controlsChanges$, objectControlChanges$, camViewControlChanges$ ,
      this.selectedMeshes$, this.objectsTransform$)
    .subscribe(
      this._render.bind(this)
    )

    //handle all the cases where events require removal of context menu
    //ie anything else but context
    Observable.merge(singleTaps$, doubleTaps$, dragMoves$, zoomIntents$)
      .take(1)
      .repeat()
      .subscribe(hideContextMenu);

    //set handling of transform modes

    function areThereSelections(){ return (self.selectedMeshes && self.selectedMeshes.length>0); }

    setToTranslateMode.filter(areThereSelections).subscribe( this.transformControls.setMode.bind(this.transformControls,"translate") )
    setToRotateMode.filter(areThereSelections).subscribe( this.transformControls.setMode.bind(this.transformControls,"rotate") )
    setToScaleMode.filter(areThereSelections).subscribe( this.transformControls.setMode.bind(this.transformControls,"scale") )


    PreventScrollBehaviour.attach( container );
    this._setupExtras();
    this._render();

    /* idea of mappings , from react-pixi
     spritemapping : {
    'vanilla' : assetpath('creamVanilla.png'),
    'chocolate' : assetpath('creamChoco.png'),
    'mocha' : assetpath('creamMocha.png'),
    'pink' : assetpath('creamPink.png'),
    },*/

    //let composer    = new THREE.EffectComposer(renderer);

    /*let renderTargetParameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: true
    };
    let renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);


    
    composer.renderTarget1.stencilBuffer = true;
    composer.renderTarget2.stencilBuffer = true;

    let normal      = new THREE.RenderPass(scene, camera);
    let outline     = new THREE.RenderPass(outScene, camera);
    outline.clear = false;
    
    let mask        = new THREE.MaskPass(maskScene, camera);
    mask.inverse = true;
    let clearMask   = new THREE.ClearMaskPass();
    let copyPass    = new THREE.ShaderPass(THREE.CopyShader);
    copyPass.renderToScreen = true;

    composer.addPass(normal);
    composer.addPass(mask);
    composer.addPass(outline);
    composer.addPass(clearMask);
    composer.addPass(copyPass);*/

    
    //window.addEventListener("resize", this.resizeHandler.bind(this) );
    //container.addEventListener( "click", this.handleTap.bind(this), false );
    //this.domElement.addEventListener( "mousedown", onPointerDown, false );
  }
  
  componentWillUnmount() {
      window.removeEventListener("resize", this.resizeHandler);
      //container.removeEventListener("click",this.projectClick)
      PreventScrollBehaviour.detach( );
  }
  
  shouldComponentUpdate(){
    //console.log("gne",this.props.cubeRot);
    //this.cube.rotation.z = this.props.cubeRot.rot.z;
    return false;
  }


  //----------------------internal stuff

  //helpers
  /*picking function to be use for mapping over evenstreams
for tap/toubleTaps etc*/
  _getSelectionsAt(event){
    log.debug("selection at",event)
    let rect = this.container.getBoundingClientRect();
    let intersects = this.selector.pickAlt({x:event.clientX,y:event.clientY}, rect, this.width, this.height, this.dynamicInjector);

    //let selectedMeshes = intersects.map( intersect => intersect.object );
    //selectedMeshes.sort().filter( ( mesh, pos ) => { return (!pos || mesh != intersects[pos - 1]) } );

    //TODO: we are mutating details, is that ok ?
    let event = Object.assign({}, event);
    event.detail = {}
    event.detail.pickingInfos = intersects;
    return event
  }

  mapDataToVisual( data, visualMapper ){
  }

  _setupExtras(){
    //helpers: these should be in a layer above the base 3d view
    this._zoomInOnObject = new ZoomInOnObject();
    this._outlineObject  = new OutlineObject();

    this._zoomInOnObject.camera = this.camera;
  }

  _makeTestStuff( ){
    let scene = this.scene;
    var geometry = new THREE.SphereGeometry( 30, 32, 16 );
    var material = new THREE.MeshLambertMaterial( { color: 0x000088 } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(0,40,0);
    //scene.add(mesh);

    var cubeGeometry = new THREE.BoxGeometry( 10, 10, 10, 1, 1, 1 );
	  //var cube = new THREE.Mesh( cubeGeometry, new THREE.MeshNormalMaterial() );
    var cube = new THREE.Mesh( cubeGeometry, new THREE.MeshBasicMaterial({color:0xff0000}) );
    //scene.add(cube);
    mesh.position.set(0,0,100);
    
    console.log("scene",this.scene)
	  this.cube = cube;
  }
  
  /*setup a camera instance from the provided data*/
  _makeCamera( cameraData ){
    //let cameraData = cameraData;//TODO: merge with defaults using object.assign
    const DEFAULTS ={
      width:window.innerWidth,
      height:window.innerHeight,
      lens:{
            fov:45,
            near:0.1,
            far:20000,
      },
      aspect: window.innerWidth/window.innerHeight,
      up:[0,0,1],
      pos:[0,0,0]
    };
    let cameraData = Object.assign({}, DEFAULTS, cameraData);

  
    let camera = new CombinedCamera(
          cameraData.width,
          cameraData.height,
          cameraData.lens.fov,
          cameraData.lens.near,
          cameraData.lens.far,
          cameraData.lens.near,
          cameraData.lens.far);

    camera.up.fromArray( cameraData.up );  
    camera.position.fromArray( cameraData.pos );
    return camera;
  }
  
  
   /*setup a controls instance from the provided data*/
  _makeControls( controlsData ){
    let controlsData = controlsData;//TODO: merge with defaults using object.assign
    let controls = new OrbitControls(this.camera, this.container,new THREE.Vector3(0,0,1));
    controls.setDomElement( this.container );
    controls.addObject( this.camera );
    controls.upVector = new THREE.Vector3(0,0,1);
    
    controls.userPanSpeed = controlsData.panSpeed;
    controls.userZoomSpeed = controlsData.zoomSpeed;
  	controls.userRotateSpeed = controlsData.rotateSpeed;

    controls.autoRotate = controlsData.autoRotate.enabled;
    controls.autoRotateSpeed = controlsData.autoRotate.speed;
    
    this.controls = controls;
    return controls;
  }

  _makeLight( lightData ){
    let light = undefined;
    const DEFAULTS ={
      color:"#FFF",
      intensity:1,
      pos: [0,0,0]
    };
    let lightData = Object.assign({}, DEFAULTS, lightData);

    switch(lightData.type){
      case "light":
         light = new THREE.Light(lightData.color);
         light.intensity = lightData.intensity;
      break;
      case "hemisphereLight":
        light = new THREE.HemisphereLight(lightData.color, lightData.gndColor, lightData.intensity);
      break;
      case "ambientLight":
        // ambient light does not have intensity, only color
        let newColor = new THREE.Color( lightData.color );
        newColor.r *= lightData.intensity;
        newColor.g *= lightData.intensity;
        newColor.b *= lightData.intensity;
        light = new THREE.AmbientLight( newColor )
      break;
      case "directionalLight":
        const dirLightDefaults = {
          castShadow:false,
          onlyShadow:false,

          shadowMapWidth:2048,
          shadowMapHeight:2048,
          shadowCameraLeft:-500,
          shadowCameraRight:500,
          shadowCameraTop:500,
          shadowCameraBottom:-500,
          shadowCameraNear: 1200,
          shadowCameraFar:5000,
          shadowCameraFov:50,
          shadowBias:0.0001,
          shadowDarkness:0.3,
          shadowCameraVisible:false
        };
        lightData = Object.assign({}, dirLightDefaults, lightData);
        light = new THREE.DirectionalLight( lightData.color, lightData.intensity );
        for(var key in lightData) {
          if(light.hasOwnProperty(key)) {
            light[key] = lightData[key]
          }
        }

      break;
      default:
        throw new Error("could not create light")
      break
    }

    light.position.fromArray( lightData.pos );

    this.scene.add( light );

    return light
  }

  selectMeshes(event){
    let intersects = event.detail.pickingInfos;
    let rect = this.container.getBoundingClientRect();

    let selectedMeshes = intersects.map( intersect => intersect.object );
    selectedMeshes.sort().filter( ( mesh, pos ) => { return (!pos || mesh != intersects[pos - 1]) } );

    selectedMeshes = selectedMeshes.shift();//we actually only get the best match
    if(selectedMeshes){ selectedMeshes = [selectedMeshes]; }
    else{ selectedMeshes = []}
    //console.log("selectedMeshes",selectedMeshes);

    this.selectedMeshes = selectedMeshes;
    this.setState({
      selectedMeshes: selectedMeshes
    })


    if(this._prevSelectedMeshes && this._prevSelectedMeshes.length>0){
      console.log(this._prevSelectedMeshes)
      this.transformControls.detach(this._prevSelectedMeshes[0])
    }

    if(selectedMeshes.length>0){
      this.transformControls.attach(selectedMeshes[0])
    }

    /* function show(selectedMesh){
      console.log("selectedMesh",selectedMesh);
    }*/
    this._prevSelectedMeshes = this.selectedMeshes;

    this.selectedMeshes$.onNext(selectedMeshes);

    return event;
  }

  //interactions : should these be in a "wrapper above the base 3d view ?"
  handleTap(event){
    //console.log("tapped in view")
    this.selectMeshes(event);
  }

  handleDoubleTap( event ){
    log.info("double tapped",event);
    var pickingInfos = event.detail.pickingInfos;
    if(!pickingInfos) return;
    if(pickingInfos.length == 0) return;
    var object = pickingInfos[0].object; 
    //console.log("object double tapped", object);
    this._zoomInOnObject.execute( object, {position:pickingInfos[0].point} );
  }

  //"core" methods
  _animate(time) 
  {
    requestAnimationFrame( this._animate.bind(this) );


    TWEEN.update(time);

	  //this._render();		
	  this._update();
  }

  _update()
  {
	  // delta = change in time since last call (in seconds)
	  //var delta = clock.getDelta(); 
	  //controls.update();
	  //stats.update();
	  if(this.controls) this.controls.update();
    if(this.camViewControls) this.camViewControls.update();
    if(this.transformControls) this.transformControls.update();

  }
  
  _render() 
  {	
	  this.renderer.render( this.scene, this.camera );

    this.camViewRenderer.render( this.camViewScene,this.camViewCam);
  }

  /*this would actually be close to react's standard "render"
  /*NOTE: right now, too "brute force", causes flickering because of
   - adding/removing the whole
  "controlled branch" (the scene entry point which can be changed dynamically)
   - mappings between entities and visuals are provided each time
   - this should not even be in the basic "3D view " as it deals with higher abstractions

  so a "diff " method is in order , to determine what changed between two forced updates/renders

  

  */
  forceUpdate( data , mapper ){
    let dynamicInjector = new THREE.Object3D();//all dynamic mapped objects reside here
    let self = this;

    if(data && data.length>0){
      console.log("NEW",data[0].pos)
      if(this._oldEntries && this._oldEntries.length>0){
      console.log("OLD",this._oldEntries[0].pos)
      }
    }


    this._entries    =  JSON.parse(JSON.stringify(data)) || undefined;
    this._mappings   = {};

    //this._entries    = data;


    /*
    let jsondiffOptions ={
      objectHash: function(obj) {
        // this function is used only to when objects are not equal by ref
        return obj.iuid;
      },
      arrays: {
        // default true, detect items moved inside the array (otherwise they will be registered as remove+add)
        detectMove: true,
        // default false, the value of items moved is not included in deltas
        includeValueOnMove: false
      },
    }
    let jsondiffpatch = require('jsondiffpatch').create(jsondiffOptions);
    let delta = jsondiffpatch.diff(this._oldEntries, this._entries);
    try{


    if(delta && delta && delta[0].pos){

      function noUnderscore( key ){
        return key[0] !== "_";
      }
      let realChangesItems = Object.keys(delta[0].pos).filter(noUnderscore);
      realChangesItems = realChangesItems.map(function(key){return delta[0].pos[key]});
      //delta[0].pos.map()
      console.log("FOODELTA",delta[0].pos, realChangesItems);

    }
    }
    catch(error){}*/
    var diff = require('deep-diff').diff;
    var delta = diff(this._oldEntries, this._entries);

    delta.map(function(change){
      console.log("change",change);
      switch(change.kind){
        case "A":
          console.log("ARRAY")
        break;
        case "E":
          console.log("Edit")
        break;
      }
    });
    console.log("DELTA",delta)
    


    let xform = function( entity, mesh ){
      self._render();
      self.transformControls.update();

      self._mappings[entity.iuid] = mesh;

      if(entity._selected){
        mesh.material.oldColor = mesh.material.color;
        mesh.material.color.set("#FF0000")
      }else
      {
        if(mesh.material.oldColor){
          mesh.material.color = mesh.material.oldColor
        }
      }

      //console.log("MAPPINGS", self, self._mappings)
    }

   
    function renderItem (entry) {
      mapper(entry, dynamicInjector, xform);

    }
    data.map( renderItem );//entry => { this.scene.add( mapper(entry) );} )


    let oldDynamicInjector = this.dynamicInjector;
    this.dynamicInjector = dynamicInjector;
    this.scene.add( dynamicInjector );

    //FIXME: GODawfull hack 
    setTimeout(function() {
      self.scene.remove( oldDynamicInjector );
      self._render();
    }, 10);
    

    //also force render in case we do not have entities left to render
    self._render();


    this._oldEntries = JSON.parse(JSON.stringify(data));// || undefined;
    console.log("MAPPINGS", this._mappings)
    //this._oldMappings= {};
    //this._oldEntries = data;

  }

  render(){
    let webglEnabled = Detector.webgl;
    let renderContents = null;
    if(webglEnabled){
      renderContents = (
        <div>
          <div className="container" ref="container" />
          <div className="camViewControls" ref="camViewControls"/>
        </div>
      );
    }
    else{
      renderContents = <div><span>Sorry, it seems you do not have a WebGL capable computer/browser!</span></div>
    }
    return (renderContents);
  }
  
}

//document.registerReact('three-js', ThreeJs);
export default ThreeJs
