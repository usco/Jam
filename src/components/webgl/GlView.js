import THREE from 'three'
import TWEEN from 'tween.js'
import Detector from './deps/Detector.js'

import Cycle from 'cycle-react'
import React from 'react'
let Rx = Cycle.Rx
let fromEvent = Rx.Observable.fromEvent
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest
import combineTemplate from 'rx.observable.combinetemplate'
Rx.config.longStackSupport = true


import {pointerInteractions,interactionsFromCEvents,preventScroll} from '../../interactions/pointers'
import {windowResizes,elementResizes} from '../../interactions/sizing'

import Selector from './deps/Selector'
import {getCoordsFromPosSizeRect} from './deps/Selector'
import {preventDefault,isTextNotEmpty,formatData,exists} from '../../utils/obsUtils'
import {toArray} from '../../utils/utils'
import {extractChanges, transformEquals, colorsEqual, entityVisualComparer} from '../../utils/diffPatchUtils'


import OrbitControls from './deps/OrbitControls'
import CombinedCamera from './deps/CombinedCamera'
import TransformControls from './transforms/TransformControls'

import helpers from 'glView-helpers'

let LabeledGrid = helpers.grids.LabeledGrid
let ShadowPlane = helpers.planes.ShadowPlane
let CamViewControls= helpers.CamViewControls
let annotations = helpers.annotations

let ZoomInOnObject= helpers.objectEffects.ZoomInOnObject

import {selectionAt,meshFrom,isTransformTool,targetObject,
  makeCamera, makeControls, makeLight, renderMeta
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



function cameraWobble3dHint(camera, time=1500){
  let camPos = camera.position.clone()
  let target = camera.position.clone().add(new THREE.Vector3(-5,-10,-5))

  let tween = new TWEEN.Tween( camPos )
    .to( target , time )
    .repeat( Infinity )
    .delay( 500 )
    .yoyo(true)
    .easing( TWEEN.Easing.Cubic.InOut )
    .onUpdate( function () {
      camera.position.copy(camPos)
    } )
    .start()

  let camRot = camera.rotation.clone()
  //let rtarget = camera.rotation.clone().add(new THREE.Vector3(50,50,50))

  /*let tween2 = new TWEEN.Tween( camRot )
    .to( rtarget , time )
    .repeat( Infinity )
    .delay( 500 )
    .yoyo(true)
    .easing( TWEEN.Easing.Quadratic.InOut )
    .onUpdate( function () {
      camera.position.copy(camRot)
    } )
    .start()*/
  return tween
}


//extract the object & position from a pickingInfo data
function objectAndPosition(pickingInfo){
  return {object:pickingInfo.object,point:pickingInfo.point}
}

function setupPostProcess(camera, renderer, scene){
  console.log("setupPostProcess")
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


function makeOutlineFx(mesh){
  //log.debug("makeOutlineFx")
  let geometry = mesh.geometry
  let matFlat = new THREE.MeshBasicMaterial({color: 0xffffff})
  let maskMesh = new THREE.Mesh( geometry, matFlat )

  //maskMesh.quaternion = mesh.quaternion
  //maskMesh.position.fromArray( entity.pos )
  //maskMesh.rotation.fromArray( entity.rot)
  //maskMesh.scale.fromArray( entity.sca )

  let uniforms = {
    offset: {
      type: "f",
      value: 0.5
    },
    color:{ 
      type: "c", 
      value: new THREE.Color("#ff2500")//[1.0,0.0,0.0] 
    }
  }

  let shader = require("./deps/post-process/OutlineShader")
  let outShader = shader['outline']

  let matShader = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: outShader.vertex_shader,
    fragmentShader: outShader.fragment_shader
  })

  let outlineMesh = new THREE.Mesh(geometry, matShader)
  //outlineMesh.quaternion = mesh1.quaternion
  outlineMesh.material.depthTest = false

  //synch with original
  maskMesh.position.copy( mesh.position )
  maskMesh.rotation.copy( mesh.rotation )
  maskMesh.scale.copy( mesh.scale )

  outlineMesh.position.copy( mesh.position )
  outlineMesh.rotation.copy( mesh.rotation )
  outlineMesh.scale.copy( mesh.scale )
  //outlineMesh.position.fromArray( entity.pos )
  //outlineMesh.rotation.fromArray( entity.rot)
  //outlineMesh.scale.fromArray( entity.sca )

  return {maskMesh, outlineMesh}
}

/*TODO:
- remove any "this", adapt code accordingly  
- extract reusable pieces of code => 50 % done
- remove any explicit "actions" like showContextMenu$, hideContextMenu$ etc => done
- streamline all interactions
*/
////////////
function GlView(interactions, props, self){
  let config = presets

  let container$ = interactions.get("#container","ready")

  let initialized$ = interactions.subject('initialized').startWith(false) //.get('initialized','click').startWith(false)
  let update$ = Rx.Observable.interval(16,66666666667)
  //let reRender$ = Rx.Observable.just(0) //Rx.Observable.interval(16) //observable should be the merger of all observable that need to re-render the view?

  let settings$   = props.get('settings')//.startWith({camera:{autoRotate:false}})
  let items$      = props.get('items')//.startWith([])
  let selections$ = props.get('selections').startWith([]).filter(exists).distinctUntilChanged()
  let visualMappings$ = props.get('visualMappings')
  //every time either activeTool or selection changes, reset/update transform controls

  let activeTool$ = settings$.pluck("activeTool").startWith(undefined)

  //debug only
  //settings$.subscribe(function(data){console.log("SETTINGS ",data)})
  //items$.subscribe(function(data){console.log("items ",data)})
  //activeTool$.subscribe((data)=>console.log("activeTool",data))
  //selections$.subscribe((data)=>console.log("selections",data))

  let renderer = null

  let composer = null
  let composers = []
  let fxaaPass = null
  let outScene = null
  let maskScene = null

  let zoomInOnObject = null
  let sphere =null

  let scene = new THREE.Scene()
  let dynamicInjector = new THREE.Object3D()//all dynamic mapped objects reside here
  scene.add( dynamicInjector )

  let camera   = makeCamera(config.cameras[0])
  let controls = makeControls(config.controls[0])
  let transformControls = new TransformControls( camera )

  let grid        = new LabeledGrid(200, 200, 10, config.cameras[0].up)
  let shadowPlane = new ShadowPlane(2000, 2000, null, config.cameras[0].up) 

  //interactions
  zoomInOnObject = new ZoomInOnObject()

  let windowResizes$ = windowResizes(1) //get from intents/interactions ?
  let elementResizes$ = elementResizes(".container",1)

  let {shortSingleTaps$, shortDoubleTaps$, longTaps$, 
      dragMoves$, zooms$} =  pointerInteractions(interactionsFromCEvents(interactions))


  function withPickingInfos(inStream, windowResizes$ ){
    //TODO : use a stream of element size 
    let clientRect$ = Rx.Observable.just("foo") //inStream
      //.filter( e => (e && e.target) )
      //.map(e => e.target)
      //.map(target => target.getBoundingClientRect())

    return inStream
      .withLatestFrom(
        clientRect$,
        windowResizes$,
        function(event, clientRect_, resizes){
          let input = document.querySelector('.container')//canvas
          let clientRect = input.getBoundingClientRect()
          //console.log("clientRect",clientRect,"event",event)
          if(event){
            let data = {pos:{x:event.clientX,y:event.clientY},rect:clientRect,width:resizes.width,height:resizes.height,event}
            let mouseCoords = getCoordsFromPosSizeRect(data)
            return selectionAt(event, mouseCoords, camera, scene.children)
          }
          else{
            return {}
          }
        }
      )
  }

  let _shortSingleTaps$ = withPickingInfos(shortSingleTaps$, windowResizes$)
  let _shortDoubleTaps$ = withPickingInfos(shortDoubleTaps$, windowResizes$)
  let _longTaps$        = withPickingInfos(longTaps$, windowResizes$).map( meshFrom )
  
  //problem : this fires BEFORE the rest is ready
  //activeTool$.skip(1).filter(isTransformTool).subscribe(transformControls.setMode)

  //zoom with double tap
  _shortDoubleTaps$
    .map(e => e.detail.pickingInfos.shift())
    .filter(exists)
    .map( objectAndPosition )
    .subscribe( (oAndP) => zoomInOnObject.execute( oAndP.object, {position:oAndP.point} ) )

  //stream of transformations done on the current selection
  let selectionsTransforms$ = fromEvent(transformControls, 'objectChange')
      .map(targetObject)

  //contextmenu observable should return undifined when any other basic interaction
  //took place (to cancel displaying context menu , etc)
  longTaps$ = longTaps$
    .merge(
      shortSingleTaps$.map(undefined),
      shortDoubleTaps$.map(undefined),
      dragMoves$.map(undefined)
    )
    //.shareReplay(1)



  //for outlines, experimental
  function removeOutline(){
    if(outScene){
      outScene.children = []
      maskScene.children = []
    }
  }
  function outlineMesh(mesh){
    let oData = makeOutlineFx(mesh)
    if(outScene)
      outScene.add( oData.outlineMesh )

    if(maskScene)
      maskScene.add( oData.maskMesh )
    return oData
  }
  function unOutlineMesh(oData){
    if(oData && outScene && maskScene){
      console.log("actually removing stuff y know")
      outScene.remove(oData.outlineMesh)
      maskScene.remove(oData.maskMesh)
    }
  }

  function makeFx(){
    let fxByObject = new WeakMap()

    function applyFx(fx,objects){
      //console.log("applyFx to",objects,"fxByObject",fxByObject)
      objects.map(function(object){
        if(!object.highlight)//FIXME: hack: only annotations have these
        {
          let fxData = outlineMesh(object)
          fxByObject.set( object, fxData )  //[object]= fxData//"outline"
        }
        else{ object.highlight(true) }

      })
    }

    function removeFx(fx, objects){
      //console.log("removeFx from",objects,"fxByObject",fxByObject)
      objects.map(function(object){
        if(!object.highlight)//FIXME: hack: only annotations have these
        {
          let fxData = fxByObject.get(object)
          unOutlineMesh(fxData)
          fxByObject.delete(object)
          //delete fxByObject[object]
        }
        else{ object.highlight(false) }
      })
    }

    return {applyFx,removeFx}
  }

  function compareHash(obj){
    if(obj.uuid) return obj.uuid
      //return JSON.stringify(obj)
    //return typeof(obj)+obj.name
  }

  let jsondiffpatch = require('jsondiffpatch').create({objectHash:compareHash})



  let {applyFx,removeFx} = makeFx()

  //TODO: only do once
  let meshes$ = selections$
    .debounce(200)
    .distinctUntilChanged(null, entityVisualComparer)
    .withLatestFrom( visualMappings$ ,function(selections, mapper){   
      return selections
        .map(mapper)
        .map(s=>s.take(1))
    })
    .map(function(data){//do all this to handle empty arrays of selections
      if(data && data.length>0) return data 
      return [Rx.Observable.just(undefined)]
    })
    .flatMap(Rx.Observable.forkJoin)
    //.shareReplay(1)

  meshes$
    .bufferWithCount(2,1)
    .subscribe(function(meshesBuff){
      let [prev,cur] = meshesBuff

      let {added,removed,changed} = extractChanges(prev,cur)
      applyFx(null,added)
      removeFx(null,removed)
    },e=>console.log("error",e))



  //TODO: we need some diffing etc somewhere in here  
  //ie : which were added , which were removed, which ones were changed
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
  function addMeshToScene(mesh){
     scene.dynamicInjector.add(mesh)
  }

 
  items$
    .debounce(200)
    .distinctUntilChanged(null, entityVisualComparer)
    .withLatestFrom( visualMappings$ ,function(items, mapper){
      console.log("MAPPING TO VISUALS",mapper, items)
      return items
        .filter(exists)
        .map(mapper)
        .map(s=>s.take(1))
    })
    .do(clearScene)
    .flatMap(Rx.Observable.forkJoin)
    .subscribe(function(meshes){
      meshes.map(addMeshToScene)
    })
   
  /*items$
    .withLatestFrom( visualMappings$ ,function(items, mapper){
      console.log("visualMappings diff test",mapper, items)
     
      if(items){
        let obs = items.map(mapper).map(s=>s.take(1))
        Rx.Observable.forkJoin(obs)
          .bufferWithTimeOrCount(16,2)
          .subscribe(function(meshes){
            console.log("meshes",meshes)
        })
      }
    })
    .subscribe(e=>e)*/

  //Stream of selected meshes
  let selectedMeshes$ = merge(
    _shortSingleTaps$.map( meshFrom ),
    _longTaps$
    ,meshes$
    )
  .map(toArray)//important !!
  .distinctUntilChanged()
  .shareReplay(1)

  //transformControls handling
  //we modify the transformControls mode based on the active tool
  //every time either activeTool or selection changes, reset/update transform controls
  combineTemplate({
    tool:activeTool$,  //.filter(isTransformTool)),
    selections:selectedMeshes$
  })
    .subscribe( 
      function(data){
        let {tool,selections} = data
        //console.log("data",data, tool, selections)
        transformControls.detach()

        selections.map(function(mesh){
           if(tool && mesh && ["translate","rotate","scale"].indexOf(tool)>-1 )
          {
            transformControls.attach(mesh)
            transformControls.setMode(tool)
          }
        })
      } 
      ,(err)=>console.log("error in setting transform",err)
    )

  
  //this limits "selectability" to transforms & default 
  selectedMeshes$ =
    selectedMeshes$.
    withLatestFrom(activeTool$,function(meshes,tool)
      {
        let idx = ["translate","rotate","scale",undefined].indexOf(tool)
        if(idx > -1)
        {
          return meshes
        }else{
          return []
        }
      })


  //what are the active controls : camera, object tranforms, 
  let tControlsActive$ = merge(
    fromEvent(transformControls,"mouseDown").map(true),
    fromEvent(transformControls,"mouseUp").map(false)
  ).startWith(false)
 
  //let activeControls$
  //if transformControls are active, filter out dragMove gestures
  let fDragMoves$ = dragMoves$
    .combineLatest(tControlsActive$,function(dragMoves,tCActive){
      if(tCActive) return undefined
      return dragMoves
    })
    .filter(exists) 

  let filteredInteractions$ = {dragMoves$:fDragMoves$, zooms$}


  //hande all the cases where events require re-rendering
  let reRender$ = merge(
    initialized$
    //update$
    //,Rx.Observable.timer(2000).take(1)
    
    ,fromEvent(controls,'change')
    ,fromEvent(transformControls,'change')
    //,fromEvent(camViewControls,'change')
    //,selectedMeshes$ 
    //,selectionsTransforms$
    ,selections$
    //,items$
    ,meshes$
    ,dragMoves$
    )
    .sample(15)
    .shareReplay(1)
  

  //reRender$.subscribe( () => console.log("reRender"), (err)=>console.log("error in reRender",err))
  //actual 3d stuff
  reRender$.subscribe(e=>render())



  function setupScene(){
    var sphereGeometry = new THREE.SphereGeometry( 20, 32, 16 ) 
    var sphereMaterial = new THREE.MeshLambertMaterial( {color: 0x8888ff} );
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.position.set(0, 0, 30)
    sphere.geometry.computeBoundingSphere()
    sphere.geometry.computeBoundingBox()
    sphere.selectTrickleUp = false 
    sphere.selectable = true
    sphere.castShadow = true
    //scene.add(sphere)
    for( let light of config.scenes["main"])
    {
      scene.add( makeLight( light ) )
    }
  }
    
  function render(scene, camera){
    //renderer.render( scene, camera )
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

  function configure (container){
    //log.debug("initializing into container", container)

    if(!Detector.webgl){
      //renderer = new CanvasRenderer() 
    } else {
      renderer = new THREE.WebGLRenderer( {antialias:false} )
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

    controls.setObservables(filteredInteractions$)
    controls.addObject( camera )

    transformControls.setDomElement( container )

    //not a fan
    zoomInOnObject.camera = camera

    scene.add(camera)  
    scene.add(shadowPlane)
    scene.add(transformControls)

    let ppData = setupPostProcess(camera, renderer, scene)
    //composer = ppData.composer
    composers = ppData.composers
    fxaaPass = ppData.fxaaPass
    outScene = ppData.outScene
    maskScene = ppData.maskScene

  }

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

      render()
    }
  }

  ///////////
  setupScene()


  interactions.get('canvas', 'contextmenu').subscribe( e => preventDefault(e) )
  windowResizes$.subscribe(  handleResize  )
  update$.subscribe( update )
  settings$.filter(exists).subscribe(function(settings){
    controls.autoRotate = settings.camera.autoRotate
  })
  //big HACK
  settings$.filter(exists).map(s => s.grid.show)
    .subscribe(function(showGrid){
      scene.remove(grid)
      if(showGrid){
        scene.add(grid)
      }
    })

  //sorta hack ??
  scene.dynamicInjector = dynamicInjector

  
  let elapsed = 0
  //for now we use refs, but once in cycle, we should use virtual dom widgets & co
  let style = {width:"100%",height:"100%"}
  let overlayStyle ={position:'absolute',top:10,left:10}
  let vtree$ =  Rx.Observable.combineLatest(
    reRender$,
    initialized$,
    settings$,
    function(reRender, initialized, settings){

      if(!initialized && self.refs.container!==undefined){
        configure(self.refs.container.getDOMNode())
        //set the inital size correctly
        handleResize({width:window.innerWidth,height:window.innerHeight,aspect:window.innerWidth/window.innerHeight})

        interactions.getEventSubject('initialized').onEvent(true)
        initialized = true

        //FIXME : needs to be done in a more coherent, reusable way
        //shut down "wobble effect if ANY user interaction takes place"
        /*let wobble = cameraWobble3dHint(camera)
        merge(
          shortSingleTaps$,
          shortDoubleTaps$,
          longTaps$,
          zooms$,
          dragMoves$
        ).subscribe(e=>wobble.stop())*/
        
      }

      if(initialized){
        render(scene,camera)
      }
      //{reRender} {initialized}
      return ()=> (
      <div className="glView" style={style} >
        <div className="container" ref="container" autofocus/>  
        <div className="camViewControls" />

        <div className="overlayTest" style={overlayStyle}>
          
        </div>
      </div>)
    })

  return {
    view: vtree$,
    events:{
      initialized:initialized$,

      shortSingleTaps$:_shortSingleTaps$,
      shortDoubleTaps$:_shortDoubleTaps$,

      longTaps$,

      selectionsTransforms$,
      selectedMeshes$,
    }
  }
}


GlView = Cycle.component('GlView', GlView, {bindThis: true})

export default GlView