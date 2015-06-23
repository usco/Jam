
import THREE from 'three'
import Detector from './deps/Detector.js'

import Cycle from 'cycle-react'
import React from 'react'
let Rx = Cycle.Rx


import {windowResizes,pointerInteractions,preventScroll} from '../../interactions/interactions'


function _GlView(interactions, props, self){
  let container$ = interactions.get("#container","ready")

  let initialized$ = interactions.subject('initialized').startWith(false) //.get('initialized','click').startWith(false)
  let items$  = props.get('items').startWith([])

  let reRender$ = Rx.Observable.interval(16)
  let windowResizes$ = windowResizes(1) //get from intents/interactions ?

  console.log("interactions",interactions,"props",props, self.refs)

  let config = {
      renderer:{
        shadowMapEnabled:true,
        shadowMapAutoUpdate:true,
        shadowMapSoft:true,
        shadowMapType : THREE.PCFSoftShadowMap,//THREE.PCFSoftShadowMap,//PCFShadowMap 
        autoUpdateScene : true,
        physicallyBasedShading : false,
        autoClear:true,
        gammaInput:false,
        gammaOutput:false
      }
  }

  let scene = new THREE.Scene()
  let dynamicInjector = new THREE.Object3D()//all dynamic mapped objects reside here
  scene.add( dynamicInjector )

  let renderer = null
  let camera = null  
  let sphere =null
  

  function setupCamera(){
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight; 
    // camera attributes
    var VIEW_ANGLE = 35, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.01, FAR = 20000
    // set up camera
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR)
    // add the camera to the scene
    
    // the camera defaults to position (0,0,0)
    //  so pull it back (z = 400) and up (y = 100) and set the angle towards the scene origin
    camera.position.set(0,150,400)
    camera.lookAt(scene.position)
  }

  function setupScene(){
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,250,0);
    scene.add(light);
    var ambientLight = new THREE.AmbientLight(0x111111);


    var sphereGeometry = new THREE.SphereGeometry( 50, 32, 16 ); 
    // use a "lambert" material rather than "basic" for realistic lighting.
    //   (don't forget to add (at least one) light!)
    var sphereMaterial = new THREE.MeshLambertMaterial( {color: 0x8888ff} ); 
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(100, 50, -50);
  }
    
  function render(scene, camera){
    renderer.render( scene, camera )
  }


  function configure (container){
    console.log("initializing into container", container)

    if(!Detector.webgl){
    //Detector.addGetWebGLMessage()
    //renderer = new CanvasRenderer() 
    } else {
      renderer = new THREE.WebGLRenderer( {antialias:false} )
    }
    renderer.setClearColor( "#fff" )
    renderer.shadowMapEnabled = config.renderer.shadowMapEnabled
    renderer.shadowMapAutoUpdate = config.renderer.shadowMapAutoUpdate
    renderer.shadowMapSoft = config.renderer.shadowMapSoft

    //renderer.shadowMapType = config.renderer.PCFSoftShadowMap//THREE.PCFShadowMap 
    //renderer.autoUpdateScene = config.renderer.autoUpdateScene
    //renderer.physicallyBasedShading = config.renderer.physicallyBasedShading
    //renderer.autoClear = config.renderer.autoClear
    renderer.gammaInput = config.renderer.gammaInput
    renderer.gammaOutput = config.renderer.gammaOutput

    let pixelRatio = window.devicePixelRatio || 1
    renderer.setPixelRatio( pixelRatio )


    container.appendChild( renderer.domElement )
    scene.add(camera)
    scene.add(sphere)
  }

  function handleResize (sizeInfos){
    console.log("setting size",sizeInfos)
    let {width,height,aspect} = sizeInfos
  
    if(width >0 && height >0 ){
      renderer.setSize( width, height )
      camera.aspect = aspect
      camera.updateProjectionMatrix()   

      //self.composer.reset()

      let pixelRatio = window.devicePixelRatio || 1
      //self.fxaaPass.uniforms[ 'resolution' ].value.set (1 / (width * pixelRatio), 1 / (height * pixelRatio))
      //self.composer.setSize(width * pixelRatio, height * pixelRatio)
    }
  }

  setupCamera()
  setupScene()

  windowResizes(1).subscribe(  handleResize  )//(data)=>console.log("windowResizes",data))

  //for now we use refs, but once in cycle, we should use virtual dom widgets & co

  let style = {width:"100%",height:"100%"}
  let overlayStyle ={position:'absolute',top:10,left:10}
  let vtree$ =  Rx.Observable.combineLatest(
    reRender$,
    initialized$,
    function(timer,initialized){

      if(!initialized && self.refs.container!==undefined){
        configure(self.refs.container.getDOMNode())
        //set the inital size correctly
        handleResize({width:window.innerWidth,height:window.innerHeight,aspect:window.innerWidth/window.innerHeight})

        interactions.getEventSubject('initialized').onEvent(true)
        initialized = true
      }

      if(initialized){
        console.log("render")
        render(scene,camera)

        camera.rotation.y += 0.05
      }

      return ()=> (
      <div className="glView" style={style}>
        <div className="container" ref="container" />  
        <div className="camViewControls" />

        <div className="overlayTest" style={overlayStyle}>
          {timer} {initialized}
        </div>
      </div>)
    })

  return {
    view: vtree$,
    events:{
      initialized:initialized$ 
    }
  }
}


let GlView = Cycle.component('GlView', _GlView, {bindThis: true})

export default GlView