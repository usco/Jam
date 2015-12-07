import THREE from 'three'
import {makeCamera, makeControls, makeLight, renderMeta
} from './utils2'
import {presets} from './presets' //default configuration for lighting, cameras etc

import EffectComposer from './deps/post-process/EffectComposer'
import ShaderPass from './deps/post-process/ShaderPass'
import RenderPass from './deps/post-process/RenderPass'
import {ClearMaskPass, MaskPass} from './deps/post-process/MaskPass'

import CopyShader     from './deps/post-process/CopyShader'
import FXAAShader     from './deps/post-process/FXAAShader'
import vignetteShader from './deps/post-process/vignetteShader'


import EdgeShader3 from './deps/post-process/EdgeShader3'
import AdditiveBlendShader from './deps/post-process/AdditiveBlendShader'


import {planes,grids,annotations,objectEffects,CamViewControls} from 'glView-helpers'
import LabeledGrid from 'glView-helpers/lib/grids/LabeledGrid'

import bufferToPng from './bufferToPng'

let gl = require('gl')()//(width, height, { preserveDrawingBuffer: true })

//console.log("helpers.grids",helpers,helpers.grids)
//let LabeledGrid = helpers.grids.LabeledGrid
let ShadowPlane    = planes.ShadowPlane

function makeGlRendering(){
}


//Helpers for offline Rendering

function contextToBuffer(gl, width, height, depth=4){
  let buffer = new Uint8Array(width * height * depth)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, buffer)
  return buffer
}

function writeBufferToFile(buffer, width, height, path){
  bufferToPng(buffer, width, height, path)
}

function writeContextToFile(context, width, height, depth, path="./test.png"){
  let buffer = contextToBuffer(context, width, height, depth)
  writeBufferToFile( buffer, width, height, path )
}

//////////////////////////////////////////////////


function setupPostProcess(renderer, camera, scene, params){

  const {width, height, devicePixelRatio} = params
  //console.log("setupPostProcess")
    ////////post processing
    let renderTargetParameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: true
    }

    let outScene = new THREE.Scene()
    let maskScene = new THREE.Scene()

    let renderTarget = new THREE.WebGLRenderTarget(width, height, renderTargetParameters)

    //setup composer
    let composer    = new EffectComposer(renderer)
    composer.renderTarget1.stencilBuffer = true
    composer.renderTarget2.stencilBuffer = true

    let normal      = new RenderPass(scene, camera)
    let outline     = new RenderPass(outScene, camera)
    let maskPass        = new THREE.MaskPass(maskScene, camera)
    maskPass.inverse = true
    let clearMask   = new THREE.ClearMaskPass()
    let copyPass     = new THREE.ShaderPass(THREE.CopyShader)
    let fxaaPass     = new THREE.ShaderPass( THREE.FXAAShader )
    let vignettePass = new THREE.ShaderPass( THREE.VignetteShader )

    fxaaPass.uniforms[ 'resolution' ].value.set( 1 / width*devicePixelRatio, 1 / height*devicePixelRatio )
    vignettePass.uniforms[ "offset" ].value = 0.95
    vignettePass.uniforms[ "darkness" ].value = 0.9

    renderer.autoClear = false
    //renderer.autoClearStencil = false    
    outline.clear = false  
    //normal.clear = false    

    composer.addPass(normal)
    composer.addPass(maskPass)
    composer.addPass(outline)
    
    composer.addPass(clearMask)
    //composer.addPass(vignettePass)
    //composer.addPass(fxaaPass)
    composer.addPass(copyPass)

    let lastPass = composer.passes[composer.passes.length-1]
    lastPass.renderToScreen = true
    
    return {composers:[composer], fxaaPass, outScene, maskScene}
    
    //return {composer:finalComposer, fxaaPass, outScene, maskScene, composers:[normalComposer,depthComposer,finalComposer]}
  }

  function setupPostProcess2(renderer, camera, scene, params){

   //FIXME hack
  if(!renderer.context.canvas){
    renderer.context.canvas = {
      width:params.width
      ,height:params.height
    }
  }

  let ppData = setupPostProcess(renderer, camera, scene, params)
  //composer = ppData.composer
  let composers = ppData.composers
  /*fxaaPass = ppData.fxaaPass
  outScene = ppData.outScene
  maskScene = ppData.maskScene*/
  return composers
}

///various helpers

function makeOfflineCanvas(){
  // mock object, not used in our test case, might be problematic for some workflow
  let canvas = new Object()
  return canvas
}

function makeLiveCanvas(){
  let canvas = document.createElement('canvas')
  return canvas
}

function handleResize (sizeInfos){
  //log.debug("setting glView size",sizeInfos)
  console.log("setting glView size",sizeInfos)
  let {width,height,aspect} = sizeInfos

  if(width >0 && height >0 && camera && renderer){
    renderer.setSize( width, height )
    camera.aspect = aspect
    camera.setSize(width,height)
    camera.updateProjectionMatrix()   
    
    let pixelRatio = window.devicePixelRatio || 1
    fxaaPass.uniforms[ 'resolution' ].value.set (1 / (width * pixelRatio), 1 / (height * pixelRatio))
    
    composers.forEach( c=> {
      c.reset()
      c.setSize(width * pixelRatio, height * pixelRatio)
    } )
  }
}

function setupWindowSpecificStuff(container, renderer){
  console.log("initializing into container",container)
  container.appendChild( renderer.domElement )

  //prevents zooming the 3d view from scrolling the window
  preventScroll(container)
  transformControls.setDomElement( container )

  //more init
  controls.setObservables( actions.filteredInteractions$ )
  controls.addObject( camera )

  //let pixelRatio = window.devicePixelRatio || 1
}



function render(renderer, composers, camera, scene ){
  composers.forEach(c=>c.render())
  //renderer.render(scene, camera)
  //composer.passes[composer.passes.length-1].uniforms[ 'tDiffuse2' ].value = composers[0].renderTarget2
  //composer.passes[composer.passes.length-1].uniforms[ 'tDiffuse3' ].value = composers[1].renderTarget2
}

function setupScene(scene, extras, config){
  config.scenes["main"]
    //TODO , update to be more generic
    .map(light=>makeLight( light ))
    .forEach(light=>scene.add(light))
}

function setupRenderer(canvas, context, config){
  const pixelRatio = 1
  
  let renderer = new THREE.WebGLRenderer( 
    {
      antialias:false,  
      preserveDrawingBuffer: true,
      width: 0,
      height: 0,
      canvas,
      context
    })
  renderer.setClearColor( "#fff" )
  //renderer.setPixelRatio( pixelRatio )
  Object.keys(config.renderer).map(function(key){
    //TODO add hasOwnProp check
    renderer[key] = config.renderer[key]
  }) 
  
  console.log("renderer setup DONE")

  return renderer
}

function getMainParams(){
  //window.innerWidth, window.innerHeight
  //window.devicePixelRatio
}

//////////////////////////////////////////////////

function view(){
  let config = presets

  let renderer = null

  let composer = null
  let composers = []
  let outScene = null
  let maskScene = null


  let scene = new THREE.Scene()
  let dynamicInjector = new THREE.Object3D()//all dynamic mapped objects reside here
  scene.dynamicInjector = dynamicInjector
  scene.add( dynamicInjector )

  const params = {
    width:320,
    height:240,
    devicePixelRatio:1
  }

  let camera   = makeCamera(config.cameras[0], params)

  //let grid        = new LabeledGrid(200, 200, 10, config.cameras[0].up) //needs CANVAS....
  let shadowPlane = new ShadowPlane(2000, 2000, null, config.cameras[0].up) 

  //controls are only needed for live aka browser mode
  //let controls = makeControls(config.controls[0])
  //let transformControls = new TransformControls( camera )
  //controls, transformControls

  const sceneExtras = [camera, shadowPlane]
  let canvas = makeOfflineCanvas()
  renderer   = setupRenderer(canvas, gl, config)
    
  setupScene(scene, sceneExtras, config)
  composers = setupPostProcess2(renderer, camera, scene, params)

  ///do the actual rendering
  render(renderer, composers, camera, scene)

  //now we output to file
  let _gl = renderer.getContext()
  writeContextToFile(_gl, params.width, params.height)//,4, path)
}


view()