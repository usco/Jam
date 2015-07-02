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


import {windowResizes,pointerInteractions,pointerInteractions2,preventScroll} from '../../interactions/interactions'
import Selector from './deps/Selector'
import {getCoordsFromPosSizeRect} from './deps/Selector'
import {preventDefault,isTextNotEmpty,formatData,exists} from '../../utils/obsUtils'

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
  makeCamera, makeControls, makeLight
} from './utils2'

import {presets} from './presets' //default configuration for lighting, cameras etc

import EffectComposer from './deps/post-process/EffectComposer'
import ShaderPass from './deps/post-process/ShaderPass'
import RenderPass from './deps/post-process/RenderPass'
import {ClearMaskPass, MaskPass} from './deps/post-process/MaskPass'

import CopyShader     from './deps/post-process/CopyShader'
import FXAAShader     from './deps/post-process/FXAAShader'
import vignetteShader from './deps/post-process/vignetteShader'


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
    
    return {composer, fxaaPass, outScene, maskScene}
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
  let update$ = Rx.Observable.interval(16)
  //let reRender$ = Rx.Observable.just(0) //Rx.Observable.interval(16) //observable should be the merger of all observable that need to re-render the view?

  let settings$   = props.get('settings')//.startWith({camera:{autoRotate:false}})
  let items$      = props.get('items').startWith([])
  let activeTool$ = props.get('activeTool')//.startWith("translate")
  let selections$ = props.get('selections').startWith([]).filter(exists).distinctUntilChanged()
  let visualMappings$ = props.get('visualMappings').startWith([])
  //every time either activeTool or selection changes, reset/update transform controls

  //debug only
  //settings$.subscribe(function(data){console.log("SETTINGS ",data)})
  //items$.subscribe(function(data){console.log("items ",data)})
  //activeTool$.subscribe((data)=>console.log("activeTool",data))

   /*Rx.Observable.combineLatest(
    items$.pluck("instances"),
    visualMappings$,
    function(instances,mappings){

      console.log("trying to map instances to visuals")

      return undefined
    })*/
  /*visualMappings$
    .filter(exists)
    .subscribe(data=>console.log("visualMappings 2",data))*/


  let renderer = null

  let composer = null
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
  let {singleTaps$, doubleTaps$, contextTaps$, 
      dragMoves$, zoomIntents$} =  pointerInteractions2(interactions)

  contextTaps$ = contextTaps$.shareReplay(1)


  function withPickingInfos(inStream, windowResizes$ ){
    let clientRect$ = inStream
      .map(e => e.target)
      .map(target => target.getBoundingClientRect())

    return inStream
      .withLatestFrom(
        clientRect$,
        windowResizes$,
        function(event, clientRect, resizes){
          //console.log("clientRect",clientRect,event, resizes)
          //return {pos:{x:event.clientX,y:event.clientY},rect:clientRect,width:resizes.width,height:resizes.height}
          let data = {pos:{x:event.clientX,y:event.clientY},rect:clientRect,width:resizes.width,height:resizes.height,event}

          let mouseCoords = getCoordsFromPosSizeRect(data)
          return selectionAt(event, mouseCoords, camera, scene.children)
        }
      )
  }

  
  let _singleTaps$ = withPickingInfos(singleTaps$, windowResizes$)

  let _doubleTaps$ = withPickingInfos(doubleTaps$, windowResizes$)

  let _contextTaps$ = withPickingInfos(contextTaps$, windowResizes$).map( meshFrom )

  
//problem : this fires BEFORE the rest is ready
  //activeTool$.skip(1).filter(isTransformTool).subscribe(transformControls.setMode)

  //hack/test
  let selections2$ = _singleTaps$.map( meshFrom ).shareReplay(1)
    //.map(function(data){console.log("data",data);return data})
  //we modify the transformControls mode based on the active tool
  //every time either activeTool or selection changes, reset/update transform controls
  let foo$ = combineTemplate({
    tool:activeTool$,  //.filter(isTransformTool)),
    selections:selections2$
  })
    //.scan(function (acc, x) { return acc + x; })
    //.sample( initialized$.filter( x => x===true) ) //skipUntil ??//Rx.Observable.timer(1000) )//initialized$)
    .subscribe( 
      function(data){
        let {tool,selections} = data
        //console.log("data",data, tool, selections)
        transformControls.detach()

        if(tool && selections)
        {
          transformControls.attach(selections)
          transformControls.setMode(tool)
        }
        
      } 
      ,(err)=>console.log("error in stuff",err)
    )

  //for outlines, experimental
  selections2$.subscribe(function(mesh){
    outScene.children = []
    maskScene.children = []

    if(mesh){
      let oData = makeOutlineFx(mesh)
      outScene.add( oData.outlineMesh )
      maskScene.add( oData.maskMesh )
    }
    
  })

  let selectedMeshes$ = selections2$


  /*let obsTest$ = Rx.Observable.timer(200, 100)
    .do((data) => console.log("data",data)) //SIDE EFFECT !!
    .map((data)=>`data${data})
    .subscribe((data)=>console.log("subscribed data",data)) */

  /*singleTaps$.subscribe(event => console.log("singleTaps"))
  doubleTaps$.subscribe(event => console.log("multiTaps"))
  contextTaps$.subscribe(event => console.log("contextTaps"))
  dragMoves$.subscribe(event => console.log("dragMoves"))
  zoomIntents$.subscribe(event => console.log("zoomIntents"))*/

  //singleTaps$ = pointerInteractions( container ).singleTaps$.map( selectionAt )
  //singleTaps$ = singleTaps$.map( selectionAt ) //stream of taps + selected meshes

  //extract the object & position from a pickingInfo data
  function objectAndPosition(pickingInfo){
    return {object:pickingInfo.object,point:pickingInfo.point}
  }

  _doubleTaps$
    .map(e => e.detail.pickingInfos.shift())
    .filter(exists)
    .map( objectAndPosition )
    //.subscribe( (oAndP) => zoomInOnObject.execute( oAndP.object, {position:oAndP.point} ) )
    .subscribe(function(oAndP){

      zoomInOnObject.execute( oAndP.object, {position:oAndP.point} ) 
    })

    //this._zoomInOnObject.execute( object, {position:pickingInfos[0].point} )

  /*contextTaps$ = contextTaps$ //handle context menu type interactions
    .map( selectionAt )
    .map( selectMeshes )
    .map( positionFromCoords )

  //handle all the cases where events require removal of context menu
  //ie anything else but context
  let stopContext$ = merge(singleTaps$, doubleTaps$, dragMoves$)//, zoomIntents$)
    .take(1)
    .repeat()
  selectedMeshes$ = singleTaps$.map( selectionAt ) //still needed ?
  */

  let selectionsTransforms$ = fromEvent(transformControls, 'objectChange')
      .map(targetObject)

  //selectionsTransforms$
  //  .subscribe(data => console.log("transforms",data.position))

  //hande all the cases where events require re-rendering
  let reRender$ = merge(
    //ready$,
    //fromEvent(controls,'change'),
    update$
    //Rx.Observable.timer(200, 100).map(2).take(3)
    //fromEvent(controls,'change'), 
    //fromEvent(transformControls,'change'), 
    //fromEvent(camViewControls,'change'),
    //selectedMeshes$, 
    //selectionsTransforms$
    )
    .shareReplay(1)
  


  //reRender$.subscribe( () => console.log("reRender"), (err)=>console.log("error in reRender",err))
  //actual 3d stuff

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
    composer.render()
  }

  function update(){
    controls.update()
    transformControls.update()
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

    controls.setDomElement( container )
    controls.addObject( camera )

    transformControls.setDomElement( container )

    //not a fan
    zoomInOnObject.camera = camera

    scene.add(camera)
    
    scene.add(shadowPlane)

    scene.add(transformControls)

    let ppData = setupPostProcess(camera, renderer, scene)
    composer = ppData.composer
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

      composer.reset()
      fxaaPass.uniforms[ 'resolution' ].value.set (1 / (width * pixelRatio), 1 / (height * pixelRatio))
      composer.setSize(width * pixelRatio, height * pixelRatio)

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

  visualMappings$
    .do(function(){
      scene.remove(scene.dynamicInjector)
      let dynamicInjector = new THREE.Object3D()//all dynamic mapped objects reside here
      scene.dynamicInjector = dynamicInjector
      scene.add( dynamicInjector )
    })
    .filter(exists)
    .subscribe(function(data){

      data.map(function(entry){
        scene.dynamicInjector.add(entry)
      })
      
    })


  let elapsed = 0
  //for now we use refs, but once in cycle, we should use virtual dom widgets & co
  let style = {width:"100%",height:"100%"}
  let overlayStyle ={position:'absolute',top:10,left:10}
  let vtree$ =  Rx.Observable.combineLatest(
    reRender$,
    initialized$,
    activeTool$,
    settings$,
    function(reRender, initialized, activeTool, settings){

      if(!initialized && self.refs.container!==undefined){
        configure(self.refs.container.getDOMNode())
        //set the inital size correctly
        handleResize({width:window.innerWidth,height:window.innerHeight,aspect:window.innerWidth/window.innerHeight})

        interactions.getEventSubject('initialized').onEvent(true)
        initialized = true
      }

      if(initialized){
        render(scene,camera)
        TWEEN.update(elapsed)
        elapsed += 30//reRender *16
        ///console.log("update")
      }

      return ()=> (
      <div className="glView" style={style} >
        <div className="container" ref="container" autofocus/>  
        <div className="camViewControls" />

        <div className="overlayTest" style={overlayStyle}>
          {reRender} {initialized}
          <div>

          </div>
        </div>
      </div>)
    })

  return {
    view: vtree$,
    events:{
      initialized:initialized$,

      singleTaps$:_singleTaps$,
      doubleTaps$:_doubleTaps$,

      contextTaps$,

      selectionsTransforms$,
      selectedMeshes$,
      /*stopContext$,

      selectedMeshes$,//is this one needed or redundant ?
      */

    }
  }
}


GlView = Cycle.component('GlView', GlView, {bindThis: true})

export default GlView