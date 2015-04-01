import React from 'react';
import THREE from 'three';
import Detector from './deps/Detector.js';

import CanvasRenderer from './deps/CanvasRenderer';
import OrbitControls from './deps/OrbitControls';
//import registerReact from 'reactive-elements';

import DndBehaviour           from '../behaviours/dndBe'
import PreventScrollBehaviour from '../behaviours/preventScrollBe'


class ThreeJs extends React.Component{
  constructor(props){
    super(props);
    console.log("props", this.props);

    this.props= {width:0,height:0};
    this.scenes = {};
    this.scene = new THREE.Scene();
    console.log( this );

    //shoud be props ?
    this.config = {
      viewports:[
        {
          name:"bla",
          
        }
      ],
      cameras:[
        {
          name:"bla",
          pos:[0,150,400],
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
      ]
    };
    
    this.state={cameras : this.config.cameras };
    //var div = this.refs.episode.getDOMNode();
  }
  
  componentDidMount(){
    let renderer = null;
    
    if(!Detector.webgl){
      //Detector.addGetWebGLMessage();
      renderer = new CanvasRenderer(); 
    } else {
      renderer = new THREE.WebGLRenderer( {antialias:true} );
    }

    this._makeCamera(this.config.cameras[0]);
    this._makeTestStuff();
    
    let container = this.refs.container.getDOMNode();
    container.appendChild( renderer.domElement );
    this.container = container;
    
    this._makeControls(this.config.controls[0]);
    
    this.renderer = renderer;
    this._animate();
    this.resizeHandler();
    
    window.addEventListener("resize", this.resizeHandler.bind(this) );
    
    container.addEventListener( "click", this.projectClick.bind(this), false );

    //this.domElement.addEventListener( "mousedown", onPointerDown, false );


    DndBehaviour.attach( container );
    DndBehaviour.dropHandler = this.handleDrop.bind(this);

    PreventScrollBehaviour.attach( container );
  }
  
  componentWillUnmount() {
      window.removeEventListener("resize", this.resizeHandler);
      //container.removeEventListener("click",this.projectClick)

      DndBehaviour.detach( );
      PreventScrollBehaviour.detach( );
  }
  
  shouldComponentUpdate(){
    //console.log("gne",this.props.cubeRot);
    //this.cube.rotation.z = this.props.cubeRot.rot.z;
    return false;
  }
  
  
  //internal stuff
  mapDataToVisual( data, visual ){
  
  }
  
  resizeHandler(){
    console.log("setting size");
    let width  = window.innerWidth
    let height = window.innerHeight;	
    let aspect = width/height;
    
    this.renderer.setSize(width, height);
    this.camera.aspect = aspect;
  }
  
  _makeTestStuff( ){
    var cubeGeometry = new THREE.BoxGeometry( 50, 50, 50, 1, 1, 1 );
	  var cube = new THREE.Mesh( cubeGeometry, new THREE.MeshNormalMaterial() );
	  cube.position.set(0, 0, 0);
	  this.scene.add( cube );
	  this.cube = cube;
  }
  
  /*setup a camera instance from the provided data*/
  _makeCamera( cameraData ){
    let cameraData = cameraData;//TODO: merge with defaults using object.assign
    let aspect = window.innerWidth/window.innerHeight;
    
    let camera = new THREE.PerspectiveCamera( cameraData.lens.fov, 
      aspect, cameraData.lens.near, cameraData.lens.far );
    camera.up.fromArray( cameraData.up );  
    camera.position.fromArray( cameraData.pos );
    camera.lookAt(this.scene.position);	
    this.camera = camera ;
	  this.scene.add( camera );
    
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
  
  projectClick(event) {
      
  }
  
  _animate() 
  {
    //console.log("this", this._render)
    requestAnimationFrame( this._animate.bind(this) );
	  this._render();		
	  this._update();
  }

  _update()
  {
	  // delta = change in time since last call (in seconds)
	  //var delta = clock.getDelta(); 
	  //controls.update();
	  //stats.update();
	  if(this.controls) this.controls.update();
  }
  
  _render() 
  {	
	  this.renderer.render( this.scene, this.camera );
  }

  __addDndBehaviour()
  {

     this.addEventListener("dragover", this.handleDragOver, false);
     this.addEventListener("drop", this.handleDrop, false);
  }

  handleDrop(data){
    console.log("something dropped on me", data)


  }
  
  render(){
    return (
      <div className="container" ref="container" />
    );
  }
  
}

//document.registerReact('three-js', ThreeJs);
export default ThreeJs
