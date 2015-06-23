
import THREE from 'three'
import Detector from './deps/Detector.js'

import Cycle from 'cycle-react'
import React from 'react'
let Rx = Cycle.Rx
let fromEvent = Rx.Observable.fromEvent
let merge = Rx.Observable.merge

import {windowResizes,pointerInteractions,preventScroll} from '../../interactions/interactions'

function positionFromCoords(coords){return{position:{x:coords.x,y:coords.y},event:coords}}
function extractObject(event){ return event.target.object}

function selectionAt(event, container, selector, width, height, dynamicInjector){
  //log.debug("selection at",event)
  
  let rect = container.getBoundingClientRect()
  let intersects = selector.pickAlt({x:event.clientX,y:event.clientY}, rect, width, height, dynamicInjector)

  //let selectedMeshes = intersects.map( intersect => intersect.object )
  //selectedMeshes.sort().filter( ( mesh, pos ) => { return (!pos || mesh != intersects[pos - 1]) } )

  //TODO: we are mutating details, is that ok ?
  //not working in safari etc
  let outEvent = {}//Object.assign({}, event)
  outEvent.clientX = event.clientX
  outEvent.clientY = event.clientY
  outEvent.offsetX = event.offsetX
  outEvent.offsetY = event.offsetY
  outEvent.x = event.x || event.clientX
  outEvent.y = event.y || event.clientY


  outEvent.detail = {}
  outEvent.detail.pickingInfos = intersects

  return outEvent
}

function selectMeshes(event, container){

  let intersects = event.detail.pickingInfos
  let rect = container.getBoundingClientRect()

  let selectedMeshes = intersects.map( intersect => intersect.object )
  selectedMeshes.sort().filter( ( mesh, pos ) => { return (!pos || mesh != intersects[pos - 1]) } )

  selectedMeshes = selectedMeshes.shift()//we actually only get the best match
  selectedMeshes = findSelectionRoot(selectedMeshes)//now we make sure that what we have is actually selectable

  if(selectedMeshes){ selectedMeshes = [selectedMeshes] }
  else{ selectedMeshes = []}

  this.selectedMeshes = selectedMeshes


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


  /*if(this.props.activeTool && ["translate","rotate","scale"].indexOf(this.props.activeTool) > -1 )
  {
    if(selectedMeshes.length>0){
      this.transformControls.attach(selectedMeshes[0])
    }
  }else{

    if(this._prevSelectedMeshes && this._prevSelectedMeshes.length>0){
      this.transformControls.detach(this._prevSelectedMeshes[0])
    }
  }*/
  this._prevSelectedMeshes = this.selectedMeshes
  this.selectedMeshes$.onNext(selectedMeshes)

  return event
}

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
  
  //singleTaps$ = pointerInteractions( container ).singleTaps$.map( selectionAt )
  let {singleTaps$, doubleTaps$, contextTaps$, 
      dragMoves$, zoomIntents$} =  pointerInteractions(container)
  
  singleTaps$ = singleTaps$.map( selectionAt ) //stream of taps + selected meshes
  doubleTaps$ = doubleTaps$.map( selectionAt )
  contextTaps$ = contextTaps$ //handle context menu type interactions
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
      .map(extractObject)

  //hande all the cases where events require re-rendering
  reRender$ = reRender$.merge(
    fromEvent(controls,'change'), 
    fromEvent(transformControls,'change'), 
    fromEvent(camViewControls,'change'),
    selectedMeshes$, 
    objectsTransform$)
 

  

  function areThereSelections(){ return (self.selectedMeshes && self.selectedMeshes.length>0) }

  /*setToTranslateMode$.filter(areThereSelections).subscribe( this.transformControls.setMode.bind(transformControls,"translate") )
  setToRotateMode$.filter(areThereSelections).subscribe( this.transformControls.setMode.bind(transformControls,"rotate") )
  setToScaleMode$.filter(areThereSelections).subscribe( this.transformControls.setMode.bind(transformControls,"scale") )*/
  //from this to  below

  function setTransformsFrom(obses, modes, controls){
    modes.map( mode => 
      obs.filter(areThereSelections).subscribe( controls.setMode.bind(controls, mode) )
    )
  }
  setTransformsFrom([setToXXX],transformControls,["translate","rotate","scale"])



  preventScroll(container)

  //console.log("interactions",interactions,"props",props, self.refs)


  //actual 3d stuff

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
      initialized:initialized$,

      singleTaps$,
      doubleTaps$,

      contextTaps$,
      stopContext$,

      selectedMeshes$,//is this one needed or redundant ?
      objectsTransforms$
    }
  }
}


let GlView = Cycle.component('GlView', _GlView, {bindThis: true})

export default GlView