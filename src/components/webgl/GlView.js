import THREE from 'three'
import TWEEN from 'tween.js'
import Detector from './deps/Detector.js'

/** @jsx hJSX */
import Cycle from '@cycle/core'
import Rx from 'rx'
import {hJSX} from '@cycle/dom'

import {equals} from 'ramda'

let fromEvent = Rx.Observable.fromEvent
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest


import {pointerInteractions,interactionsFromCEvents,preventScroll} from '../../interactions/pointers'
import {windowResizes} from '../../interactions/sizing'

import {preventDefault,isTextNotEmpty,formatData,exists,combineLatestObj} from '../../utils/obsUtils'
import {toArray,itemsEqual} from '../../utils/utils'

import {extractChanges, transformEquals, colorsEqual, entityVisualComparer} from '../../utils/diffPatchUtils'


import OrbitControls from './deps/OrbitControls'
import CombinedCamera from './deps/CombinedCamera'
import TransformControls from './transforms/TransformControls'

import {planes, grids, annotations, cameraEffects, CamViewControls,} from 'glView-helpers'

import LabeledGrid from 'glView-helpers/lib/grids/LabeledGrid'

//console.log("helpers.planes",planes,objectEffects)
//let LabeledGrid = helpers.grids.LabeledGrid
let ShadowPlane    = planes.ShadowPlane.default//ugh FIXME: bloody babel6
//let annotations    = annotations
let {zoomInOn,zoomToFit} = cameraEffects

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

function setupPostProcess(camera, renderer, scene){
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

    let renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters)

    let uniforms = {
      offset: {
        type: "f",
        value: 0.4
      },
      color:{ 
        type: "c", 
        value: new THREE.Color("#000000")//#ff2500")//[1.0,0.0,0.0] 
      }
    }

    let shader = require("./deps/post-process/OutlineShader").default
    let outShader = shader['outline']

    let outlineMaterial =  new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: outShader.vertex_shader,
      fragmentShader: outShader.fragment_shader
    })
    outlineMaterial.depthTest = false
    //new THREE.MeshBasicMaterial({color:0xFF0000,transparent:true,opacity:0.5})

    let maskMaterial = new THREE.MeshBasicMaterial({color: 0xffffff})


    //setup composer
    let composer    = new EffectComposer(renderer)
    composer.renderTarget1.stencilBuffer = true
    composer.renderTarget2.stencilBuffer = true

    let normal      = new RenderPass(scene, camera)
    let outline     = new RenderPass(outScene, camera, outlineMaterial)
    let maskPass        = new THREE.MaskPass(maskScene, camera, maskMaterial)
    maskPass.inverse = true
    let clearMask   = new THREE.ClearMaskPass()
    let copyPass     = new THREE.ShaderPass(THREE.CopyShader)
    let fxaaPass     = new THREE.ShaderPass( THREE.FXAAShader )
    let vignettePass = new THREE.ShaderPass( THREE.VignetteShader )

    fxaaPass.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth*window.devicePixelRatio, 1 / window.innerHeight*window.devicePixelRatio )
    vignettePass.uniforms[ "offset" ].value = 0.95
    vignettePass.uniforms[ "darkness" ].value = 0.9


    /*for generic outlines etc*/
    /*let edgeDetectPass = new THREE.ShaderPass(EdgeShader3)

    //depth data generation
    let width = window.innerWidth
    let height = window.innerHeight
    let depthTarget = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } )
    let depthMaterial = new THREE.MeshDepthMaterial()
    let depthPass = new THREE.RenderPass(scene, camera, depthMaterial)

    let depthComposer = new THREE.EffectComposer( renderer, depthTarget )
    depthComposer.setSize( width, height )
    depthComposer.addPass( depthPass )
    depthComposer.addPass( edgeDetectPass )
    depthComposer.addPass( copyPass )


    //normal data generation
    let normalTarget = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } )
    let normalMaterial = new THREE.MeshNormalMaterial()
    let normalPass = new THREE.RenderPass(scene, camera, normalMaterial)
        
    let normalComposer = new THREE.EffectComposer( renderer, normalTarget )
    normalComposer.setSize(width, height)
    normalComposer.addPass( normalPass )
    normalComposer.addPass( edgeDetectPass )
    normalComposer.addPass( copyPass )

    //final compositing
    //  steps:
    //  render default to @colorTarget
    //  render depth
    //  render normal
    
    let renderPass = new THREE.RenderPass(scene, camera)

    renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
    renderTarget = new THREE.WebGLRenderTarget( width , height, renderTargetParameters )
        
    let finalComposer = new THREE.EffectComposer( renderer , renderTarget )
    finalComposer.setSize(width, height)
    //prepare the final render passes
    finalComposer.addPass( renderPass )
    //finalComposer.addPass( normalPass)

    //finalComposer.addPass(fxaaPass)
    //blend in the edge detection results
    let effectBlend = new THREE.ShaderPass( AdditiveBlendShader, "tDiffuse1" )
    effectBlend.uniforms[ 'tDiffuse2' ].value = normalComposer.renderTarget2
    effectBlend.uniforms[ 'tDiffuse3' ].value = depthComposer.renderTarget2
    effectBlend.uniforms[ 'normalThreshold' ].value = 0.05
    effectBlend.uniforms[ 'depthThreshold' ].value = 0.05
    effectBlend.uniforms[ 'strengh' ].value = 0.4

    finalComposer.addPass( effectBlend )
    
    //finalComposer.addPass( vignettePass )
    finalComposer.passes[finalComposer.passes.length-1].renderToScreen = true*/


    ///////////////////////////////////

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



import intent from './intent'
import model from './model'


////////////
function GLView({drivers, props$}){
  const {DOM,postMessage} = drivers

  let config = presets

  let initialized$ = new Rx.BehaviorSubject(false)
  let update$      = Rx.Observable.interval(16,66666666667)

  let settings$       = props$.pluck('settings')
  //every time either activeTool or selection changes, reset/update transform controls
  let activeTool$ = settings$.pluck("activeTool").startWith(undefined)

  let renderer = null

  let composer = null
  let composers = []
  let fxaaPass = null
  let outScene = null
  let maskScene = null


  let scene = new THREE.Scene()
  let dynamicInjector = new THREE.Object3D()//all dynamic mapped objects reside here
  scene.dynamicInjector = dynamicInjector
  scene.add( dynamicInjector )

  let selectionsContainer = new THREE.Scene() //unfortunate way to handle things in three.js

  let camera   = makeCamera(config.cameras[0])
  let controls = makeControls(config.controls[0])
  let transformControls = new TransformControls( camera )

  let grid        = new LabeledGrid(200, 200, 10, config.cameras[0].up)
  let shadowPlane = new ShadowPlane(2000, 2000, null, config.cameras[0].up) 


  const actions = intent({DOM},{camera,scene,transformControls})
  const state$  = model(props$, actions)

  //react to actions
  actions.zoomInOnPoint$.forEach( (oAndP) => zoomInOn( oAndP.object, camera, {position:oAndP.point} ) )

  actions.zoomToFit$.forEach(function(){
    console.log("zoomToFit")
    const targetNode = dynamicInjector
    zoomToFit(targetNode, camera, new THREE.Vector3() )
  })

  let windowResizes$ = windowResizes(1) //get from intents/interactions ?


  function clearScene(){
    if(scene){
      if(scene.dynamicInjector){
        scene.remove(scene.dynamicInjector)
      }
      let dynamicInjector = new THREE.Object3D()
      scene.dynamicInjector = dynamicInjector

      scene.add( dynamicInjector )
    }
  }

  function addToScene(object){
    scene.dynamicInjector.add(object)
  }
  function removeFromScene(object){
    scene.dynamicInjector.remove(object)
  }
  
  function setupScene(){
    config.scenes["main"]
      //TODO , update to be more generic
      .map(light=>makeLight( light ))
      .forEach(light=>scene.add(light))
  }
    
  function render(scene, camera){
    composers.forEach(c=>c.render())
    //composer.passes[composer.passes.length-1].uniforms[ 'tDiffuse2' ].value = composers[0].renderTarget2
    //composer.passes[composer.passes.length-1].uniforms[ 'tDiffuse3' ].value = composers[1].renderTarget2
  }

  function update(){
    controls.update()
    transformControls.update()
    TWEEN.update()
    //if(camViewControls) camViewControls.update()
  }

  function configure(container){
    //log.debug("initializing into container", container)

    if(!Detector.webgl){
      //TODO: handle lacking webgl
    } else {
      renderer = new THREE.WebGLRenderer( {antialias:false,  preserveDrawingBuffer: true} )
    }

    renderer.setClearColor( "#fff" )
    Object.keys(config.renderer).map(function(key){
      //TODO add hasOwnProp check
      renderer[key] = config.renderer[key]
    })

    let pixelRatio = window.devicePixelRatio || 1
    renderer.setPixelRatio( pixelRatio )

    container.appendChild( renderer.domElement )
    //prevents zooming the 3d view from scrolling the window
    preventScroll(container)

    transformControls.setDomElement( container )

    //more init
    controls.setObservables( actions.filteredInteractions$ )
    controls.addObject( camera )

    scene.add(camera)  
    scene.add(shadowPlane)
    scene.add(transformControls)

    let ppData = setupPostProcess(camera, renderer, scene)
    //composer = ppData.composer
    composers = ppData.composers
    fxaaPass = ppData.fxaaPass
    outScene = ppData.outScene
    maskScene = ppData.maskScene

    initialized$.onNext(true)
  }


  //side effect ?
  function handleResize (sizeInfos){
    //log.debug("setting glView size",sizeInfos)
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

  //combine All needed components to apply any "transforms" to their visuals
  let items$ = state$.pluck("items")//.distinctUntilChanged()
  //TODO : we DO  want distinctUntilChanged() to prevent spamming here at any state change

  //do diffing to find what was added/changed
  let itemChanges$ = items$.scan(function(acc, x){
      let cur  = x
      let prev = acc.cur   
      return {cur,prev} 
    },{prev:undefined,cur:undefined})
    .map(function(typeData){
      let {cur,prev} = typeData
      let changes = extractChanges(prev,cur)
      //console.log("changes",changes)
    return changes
    })  

  //experimenting with selections effects
  state$.pluck("selectedMeshes").distinctUntilChanged()
    .forEach(function(selectedMeshes){
      if(outScene){
        outScene.children  = selectedMeshes
        maskScene.children = selectedMeshes
      }
    })

  //transformControls handling
  //we modify the transformControls mode based on the active tool
  //every time either activeTool or selection changes, reset/update transform controls
  let selectedMeshesChanges$ = state$.pluck("selectedMeshes").distinctUntilChanged()
    .scan(function(acc, x){
      let cur  = x
      let prev = acc.cur   
      return {cur,prev} 
    },{prev:[],cur:[]})
    .map(function(typeData){
      let {cur,prev} = typeData
      let changes = extractChanges(prev,cur)
    return changes
    })
    .distinctUntilChanged()
    .shareReplay(1)

  combineLatestObj({
    selections:selectedMeshesChanges$
    ,tool:activeTool$.distinctUntilChanged()
  })
  .forEach(function({selections,tool}){
    //console.log("updating transformControls",selections,tool)
    //remove transformControls from removed meshes
    selections.removed.map(mesh=>transformControls.detach(mesh))
    
    selections.added.map(function(mesh){
      if(tool && mesh && ["translate","rotate","scale"].indexOf(tool)>-1 )
      {
        transformControls.attach(mesh)
        transformControls.setMode(tool)
      }
      else if(!tool && mesh){//tool is undefined, but we still had selections
        transformControls.detach(mesh)
      }
    })
  })

  //hande all the cases where events require re-rendering
  let reRender$ = merge(
    initialized$
      .filter(i=>i===true)
      .do(i=>handleResize({width:window.innerWidth,height:window.innerHeight,aspect:window.innerWidth/window.innerHeight}))
      
    ,fromEvent(controls,'change')
    ,fromEvent(transformControls,'change')
    ,state$.pluck("selectedMeshes")

    ,windowResizes$.do(handleResize)//we need the resize to take place before we render
  )
  .shareReplay(1)

  ///////////
  setupScene()

  update$.forEach( update )
  reRender$.forEach( render )

  //settings handling
  settings$ = settings$
    .filter(exists)
    .distinctUntilChanged()

  settings$.map(s => s.camera.autoRotate)
    .forEach(autoRotate => controls.autoRotate = autoRotate )

  settings$.map(s => s.grid.show)
    .forEach(function(showGrid){
      scene.remove(grid)
      if(showGrid){
        scene.add(grid)
      }
    })

  //react based on diffs
  itemChanges$
    .do(function(changes){
      changes.added.map( m=>addToScene(m) )
      changes.removed.map( m=> removeFromScene(m)  )
    })
    .do(e=>render())
    .forEach(e=>e)

  //we do not want to change our container (DOM) but the contents (gl)
  const gLWidgeHelper = new GLWidgeHelper(configure)
  //new GLWidgeHelper(configure)}
  //gLWidgeHelper.setup()

  const vtree$ = Rx.Observable.just(
    <div className="glView" >
      {gLWidgeHelper}
    </div>
  )

  //screencapture test
  /*postMessage
    .filter(e=>e.hasOwnProperty("captureScreen"))
    .flatMap(e=>{
      let img = domElementToImage(renderer.domElement)
      
      let resolutions = e.captureScreen

      let images$ = resolutions.map(function(resolution){
          let [width,height] = resolution
          console.log("resolution",resolution)

          let obs = new Rx.Subject()
          aspectResize(img, width, height, e=>{ 
            obs.onNext(e)
            obs.onCompleted()})
          return obs
        })
      
      let results$ = Rx.Observable.forkJoin(images$)

      return results$
    })
    .forEach(e=>{
      e.map(img=>console.log(img))
    })*/


  return {
    DOM: vtree$
    ,events:{
      //initialized:initialized$,
      shortSingleTaps$:actions.shortSingleTapsWPicking$
      ,shortDoubleTaps$:actions.shortDoubleTapsWPicking$
      ,longTaps$:actions.longTapsWPicking$

      ,selectionsTransforms$:actions.selectionsTransforms$
      ,selectedMeshes$:actions.selectMeshes$
    }
  }
}

function GLWidgeHelper(configureFn, configCallback) {
  //console.log("creating GLWidgeHelper")
  this.type = 'Widget'
  this.configureFn = configureFn
  this.configCallback = configCallback
}

GLWidgeHelper.prototype.setup = function(){
  this.configureFn(this.elem,this.configCallback)
}

GLWidgeHelper.prototype.init = function () {
  //console.log("init GLWidgeHelper",this.elem)
  //if(!this.elem)//in weird cases, this gets called for SOME ?? reason
  //{
    let elem = document.createElement('div')
    elem.className = "container"
    this.elem = elem
    this.setup() 
  //}
  
  return this.elem
}

GLWidgeHelper.prototype.update = function (prev, elem) {
  //console.log("update GLWidgeHelper" )
  this.elem = this.elem || prev.elem
}

export default GLView