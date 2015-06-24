
import THREE from 'three'
import Detector from './deps/Detector.js'

import Cycle from 'cycle-react'
import React from 'react'
let Rx = Cycle.Rx
let fromEvent = Rx.Observable.fromEvent
let merge = Rx.Observable.merge

import {windowResizes,pointerInteractions,pointerInteractions2,preventScroll} from '../../interactions/interactions'
import Selector from './deps/Selector'
import {pick, getCoordsFromPosSizeRect, findSelectionRoot} from './deps/Selector'
import {preventDefault,isTextNotEmpty,formatData,exists} from '../../utils/obsUtils'



function positionFromCoords(coords){return{position:{x:coords.x,y:coords.y},event:coords}}
function extractObject(event){ return event.target.object}

function selectionAt(event, mouseCoords, camera, hiearchyRoot){
  //log.debug("selection at",event)
  //, container, selector, width, height, rootObject

  //let intersects = selector.pickAlt({x:event.clientX,y:event.clientY}, rect, width, height, rootObject)
  let intersects = pick(mouseCoords, camera, hiearchyRoot )//, ortho = false, precision=10)

  let outEvent = {}
  outEvent.clientX = event.clientX
  outEvent.clientY = event.clientY
  outEvent.offsetX = event.offsetX
  outEvent.offsetY = event.offsetY
  outEvent.x = event.x || event.clientX
  outEvent.y = event.y || event.clientY
  //outEvent.rect = event.rect

  outEvent.detail = {}
  outEvent.detail.pickingInfos = intersects

  return outEvent
}

function meshesFrom(event){
  let intersects = event.detail.pickingInfos

  let selectedMeshes = intersects.map( intersect => intersect.object )
  selectedMeshes = selectedMeshes.shift()//we actually only get the best match
  selectedMeshes = findSelectionRoot(selectedMeshes)//now we make sure that what we have is actually selectable

  if(selectedMeshes){ selectedMeshes = [selectedMeshes] }
  else{ selectedMeshes = []}

  return selectedMeshes
}

  //TODO: rethink this
  /*
  if(this._prevSelectedMeshes && this._prevSelectedMeshes.length>0){
        this.transformControls.detach(this._prevSelectedMeshes[0])
    }
  if(selectedMeshes.length>0){
    //if(["0","1","2","3"].indexOf(selectedMeshes[0].typeUid) === -1 )
    if(this.props.activeTool && ["translate","rotate","scale"].indexOf(this.props.activeTool) > -1 )
    {
      this.transformControls.attach(selectedMeshes[0])
    }
  }


  function areThereSelections(){ return (self.selectedMeshes && self.selectedMeshes.length>0) }
  
  setToTranslateMode$.filter(areThereSelections).subscribe( this.transformControls.setMode.bind(transformControls,"translate") )
  setToRotateMode$.filter(areThereSelections).subscribe( this.transformControls.setMode.bind(transformControls,"rotate") )
  setToScaleMode$.filter(areThereSelections).subscribe( this.transformControls.setMode.bind(transformControls,"scale") )
  //from this to  below

  function setTransformsFrom(obses, modes, controls){
    modes.map( mode => 
      obs.filter(areThereSelections).subscribe( controls.setMode.bind(controls, mode) )
    )
  }
  setTransformsFrom([setToXXX],transformControls,["translate","rotate","scale"])*/


/*TODO:
- remove any "this", adapt code accordingly 
- extract reusable pieces of code
- remove any explicit "actions" like showContextMenu$, hideContextMenu$ etc
- streamline all interactions
*/


////////////
function _GlView(interactions, props, self){
  let container$ = interactions.get("#container","ready")

  let initialized$ = interactions.subject('initialized').startWith(false) //.get('initialized','click').startWith(false)
  let reRender$ = Rx.Observable.interval(16) //observable should be the merger of all observable that need to re-render the view?
  let items$  = props.get('items').startWith([])
  let windowResizes$ = windowResizes(1) //get from intents/interactions ?
  
  let renderer = null
  let camera = null  
  let sphere =null

  let scene = new THREE.Scene()
  let dynamicInjector = new THREE.Object3D()//all dynamic mapped objects reside here
  scene.add( dynamicInjector )


  let {singleTaps$, doubleTaps$, contextTaps$, 
      dragMoves$, zoomIntents$} =  pointerInteractions2(interactions)

  contextTaps$ = contextTaps$.shareReplay(1)
  /*singleTaps$.subscribe(event => console.log("singleTaps"))
  doubleTaps$.subscribe(event => console.log("multiTaps"))
  contextTaps$.subscribe(event => console.log("contextTaps"))
  dragMoves$.subscribe(event => console.log("dragMoves"))
  zoomIntents$.subscribe(event => console.log("zoomIntents"))*/

  function withPickingInfos(inStream, windowResizes$ ){
    let clientRect$ = inStream
      .map(e => e.target)
      .map(target => target.getBoundingClientRect())

    return inStream
      .withLatestFrom(
        clientRect$,
        windowResizes$,
        function(event, clientRect, resizes){
          console.log("clientRect",clientRect,event, resizes)
          //return {pos:{x:event.clientX,y:event.clientY},rect:clientRect,width:resizes.width,height:resizes.height}
          let data = {pos:{x:event.clientX,y:event.clientY},rect:clientRect,width:resizes.width,height:resizes.height,event}

          let mouseCoords = getCoordsFromPosSizeRect(data)
          return selectionAt(event, mouseCoords, camera, scene.children)
        }
      )
  }

  
  withPickingInfos(singleTaps$, windowResizes$)
    .subscribe(data => console.log("singleTaps",data),err=>console.log("error",err))

  withPickingInfos(doubleTaps$, windowResizes$)
    .subscribe(data => console.log("doubleTaps",data),err=>console.log("error",err))

  withPickingInfos(contextTaps$, windowResizes$)
    .map( meshesFrom )
    .subscribe(data => console.log("contextTaps",data),err=>console.log("error",err))



  //singleTaps$ = pointerInteractions( container ).singleTaps$.map( selectionAt )
  //singleTaps$ = singleTaps$.map( selectionAt ) //stream of taps + selected meshes
  //doubleTaps$ = doubleTaps$.map( selectionAt ) //this._zoomInOnObject.execute( object, {position:pickingInfos[0].point} )


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

  let objectsTransforms$ = fromEvent(transformControls, 'objectChange')
      .map(extractObject)*/

  //hande all the cases where events require re-rendering
  /*reRender$ = reRender$.merge(
    fromEvent(controls,'change'), 
    fromEvent(transformControls,'change'), 
    fromEvent(camViewControls,'change'),
    selectedMeshes$, 
    objectsTransform$)*/
 
  

  //preventScroll(container)
  interactions.get('canvas', 'contextmenu').subscribe( e => preventDefault(e) )

  //console.log("interactions",interactions,"props",props, self.refs)

  //actual 3d stuff

  let config = {
      renderer:{
        shadowMapEnabled:true,
        shadowMapAutoUpdate:true,
        shadowMapSoft:true,
        shadowMapType : undefined,//THREE.PCFSoftShadowMap,//THREE.PCFSoftShadowMap,//PCFShadowMap 
        autoUpdateScene : true,//Default ?
        physicallyBasedShading : false,//Default ?
        autoClear:true,//Default ?
        gammaInput:false,
        gammaOutput:false
      }
  }

  

  function setupCamera(){
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight; 
    var VIEW_ANGLE = 35, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.01, FAR = 20000
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR)
    camera.position.set(0,150,400)
    camera.lookAt(scene.position)
  }

  function setupScene(){
    var light = new THREE.PointLight(0xffffff)
    light.position.set(0,250,0)
    scene.add(light)

    var sphereGeometry = new THREE.SphereGeometry( 50, 32, 16 ) 
    var sphereMaterial = new THREE.MeshLambertMaterial( {color: 0x8888ff} );
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.position.set(100, 50, -50)
    scene.add(sphere)
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
    Object.keys(config.renderer).map(function(key){
      //TODO add hasOwnProp check
      renderer[key] = config.renderer[key]
    })

    let pixelRatio = window.devicePixelRatio || 1
    renderer.setPixelRatio( pixelRatio )

    container.appendChild( renderer.domElement )
    scene.add(camera)
  }

  function handleResize (sizeInfos){
    console.log("setting size",sizeInfos)
    let {width,height,aspect} = sizeInfos
  
    if(width >0 && height >0 && camera && renderer){
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

  windowResizes(1).subscribe(  handleResize  )


  //for now we use refs, but once in cycle, we should use virtual dom widgets & co
  let style = {width:"100%",height:"100%"}
  let overlayStyle ={position:'absolute',top:10,left:10}
  let vtree$ =  Rx.Observable.combineLatest(
    reRender$,
    initialized$,
    function(reRender, initialized){

      if(!initialized && self.refs.container!==undefined){
        configure(self.refs.container.getDOMNode())
        //set the inital size correctly
        handleResize({width:window.innerWidth,height:window.innerHeight,aspect:window.innerWidth/window.innerHeight})

        interactions.getEventSubject('initialized').onEvent(true)
        initialized = true
      }

      if(initialized){
        render(scene,camera)
        //camera.rotation.y += 0.005
      }

      return ()=> (
      <div className="glView" style={style}>
        <div className="container" ref="container" />  
        <div className="camViewControls" />

        <div className="overlayTest" style={overlayStyle}>
          {reRender} {initialized}
        </div>
      </div>)
    })

  return {
    view: vtree$,
    events:{
      initialized:initialized$,

      singleTaps$,
      doubleTaps$,

      contextTaps$,
      /*stopContext$,

      selectedMeshes$,//is this one needed or redundant ?
      objectsTransforms$*/
    }
  }
}


let GlView = Cycle.component('GlView', _GlView, {bindThis: true})

export default GlView