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

  const {width, height, devicePixelRatio, renderToScreen} = params
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
    lastPass.renderToScreen = renderToScreen
    
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

function makeCanvas(){
  if(typeof window !== 'undefined'){
    return makeLiveCanvas()
  }
  return makeOfflineCanvas()
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

function setupNodeSpecificStuff(renderer, camera, scene){
  camera.lookAt(scene.position)

  
}

function monkeyPatchGl(gl){
  console.log("shaderSource")//,gl.shaderSource)



  function checkObject(object) {
    return typeof object === 'object' ||
         (object       === void 0)
  }

  //Don't allow: ", $, `, @, \, ', \0
  function isValidString(str) {
      return !(/[\"\$\`\@\\\'\0]/.test(str))
  }

  function checkWrapper(context, object, wrapper) {
    if(!checkValid(object, wrapper)) {
      setError(context, gl.INVALID_VALUE)
      return false
    } else if(!checkOwns(context, object)) {
      setError(context, gl.INVALID_OPERATION)
      return false
    }
    return true
  }


  function shaderSource(shader, source) {
    if(!checkObject(shader)) {
      throw new TypeError('shaderSource(WebGLShader, String)')
    }
    if(!shader || (!source && typeof source !== 'string')) {
      setError(this, gl.INVALID_VALUE)
      return
    }
    source += ''
    if(!isValidString(source)) {
      setError(this, gl.INVALID_VALUE)
      return
    } else if(checkWrapper(this, shader, WebGLShader)) {

      //patch 
      if(source.indexOf( 'precision' ) >= 0){

        //'#ifdef GL_ES',
        var sourceChunks = source.split('\n')
        
        sourceChunks.map(function(chunk){
          console.log("chunk",chunk)
        })

        //sourceChunks = sourceChunks.concat(['#endif'])
        source = sourceChunks.concat('\n')
      }

      _shaderSource.call(this, shader._|0, wrapShader(shader._type, source))
      shader._source = source
    }
  }
  //gl.shaderSource = shaderSource.bind(gl)
  return gl

  //gl.shaderSource()
  //
}


function render(renderer, composers, camera, scene ){
  composers.forEach(c=>c.render())
  //renderer.render(scene, camera)
  
  /*let width = 640
  let height = 480
  let rtTexture = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat
  })

  renderer.render(scene, camera, rtTexture, true)*/

  //composer.passes[composer.passes.length-1].uniforms[ 'tDiffuse2' ].value = composers[0].renderTarget2
  //composer.passes[composer.passes.length-1].uniforms[ 'tDiffuse3' ].value = composers[1].renderTarget2
}

function setupScene(scene, extras, config){
  config.scenes["main"]
    //TODO , update to be more generic
    .map(light=>makeLight( light ))
    .forEach(light=>scene.add(light))

  return scene
}

function setupRenderer(canvas, context, config){
  const pixelRatio = 1
  
  let renderer = new THREE.WebGLRenderer( 
    {
      antialias:false,  
      preserveDrawingBuffer: true,
      //width: 0,
      //height: 0,
      canvas,
      context
    })
  renderer.setClearColor( "#fff" )
  renderer.setPixelRatio( pixelRatio )
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

export default function view(data){
  let {mesh,uri} = data

  let config = presets
  const params = {
    width:640
    ,height:480
    ,devicePixelRatio:1
    ,renderToScreen:(typeof window !== 'undefined')//FALSE if you want server side renders
  }

  gl = monkeyPatchGl(gl)

  let renderer = null
  let composer = null
  let composers = []
  let outScene = null
  let maskScene = null


  let scene = new THREE.Scene()
  let dynamicInjector = new THREE.Object3D()//all dynamic mapped objects reside here
  scene.dynamicInjector = dynamicInjector
  scene.add( dynamicInjector )

  let camera   = makeCamera(config.cameras[0], params)
   //let grid        = new LabeledGrid(200, 200, 10, config.cameras[0].up) //needs CANVAS....
  let shadowPlane = new ShadowPlane(2000, 2000, null, config.cameras[0].up) 

  let geometry = new THREE.BoxGeometry(100,100,100)

  let material = new THREE.ShaderMaterial();
  material.vertexShader = 'void main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}';
  material.fragmentShader = 'void main() {\n    gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}';
  material.uniforms = {}

  //material = new THREE.MeshBasicMaterial( { color: 0xf0ff00 } )
  //material = new THREE.MeshPhongMaterial( { color: 0x17a9f5, specular: 0xffffff, shininess: 5, shading: THREE.FlatShading} )//NOT WORKING => black shape
  //material = new THREE.MeshBasicMaterial( { color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending } ) //NOT WORKING => all white
  //material = new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.SmoothShading } )  //NOT WORKING => black shape
  material = new THREE.MeshNormalMaterial( { shading: THREE.SmoothShading } ) //THIS WORKS
  //material = new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } )//THIS WORKS
  //material = new THREE.MeshDepthMaterial() //NOT WORKING => all white
  let cube     = new THREE.Mesh(geometry, material)
  //scene.add(cube)
  //hack
  mesh.material = material
  scene.add(mesh)


  //controls are only needed for live aka browser mode
  //let controls = makeControls(config.controls[0])
  //let transformControls = new TransformControls( camera )
  //controls, transformControls

  const sceneExtras = [camera, shadowPlane]
  let canvas = makeCanvas()
  renderer   = setupRenderer(canvas, gl, config)
    
  scene      = setupScene(scene, sceneExtras, config)

  composers  = setupPostProcess2(renderer, camera, scene, params)

  //do context specific config
  setupNodeSpecificStuff(renderer, camera, scene)

  ///do the actual rendering
  render(renderer, composers, camera, scene)

  //now we output to file
  let _gl = renderer.getContext()
  writeContextToFile(_gl, params.width, params.height,4,uri)//,4, path)
}

