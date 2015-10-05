import THREE from 'three'
import OrbitControls from './deps/OrbitControls'
import CombinedCamera from './deps/CombinedCamera'

import {pick, getCoordsFromPosSizeRect, findSelectionRoot} from './deps/Selector'

export function positionFromCoords(coords){return{position:{x:coords.x,y:coords.y},event:coords}}
export function targetObject(event){ return event.target.object}
export function isTransformTool(input){ return ["translate","rotate","scale",null,undefined].indexOf(input) > -1 }

export function selectionAt(event, mouseCoords, camera, hiearchyRoot){
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

  outEvent.detail = {}
  outEvent.detail.pickingInfos = intersects

  return outEvent
}

export function meshFrom(event){
  let mesh = undefined
  if( event && event.detail && event.detail.pickingInfos){
    let intersect = event.detail.pickingInfos.shift() //we actually only get the best match
    if(intersect && intersect.object) {
      mesh = findSelectionRoot(intersect.object)//now we make sure that what we have is actually selectable
    }
  }
  return mesh
}

////////////Various "making" functions , data/config in, (3d object) instances out 
//yup, like factories ! yikes !

/*create a camera instance from the provided data*/
export function makeCamera( cameraData ){
  //let cameraData = cameraData//TODO: merge with defaults using object.assign
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
  }
  cameraData = Object.assign({}, DEFAULTS, cameraData)


  let camera = new CombinedCamera(
        cameraData.width,
        cameraData.height,
        cameraData.lens.fov,
        cameraData.lens.near,
        cameraData.lens.far,
        cameraData.lens.near,
        cameraData.lens.far)

  camera.up.fromArray( cameraData.up )  
  camera.position.fromArray( cameraData.pos )
  return camera
}


/*setup a controls instance from the provided data*/
export function makeControls( controlsData ){
  let up = new THREE.Vector3().fromArray( controlsData.up )

  //controlsData = controlsData//TODO: merge with defaults using object.assign
  let controls = new OrbitControls(undefined, undefined, up )
  controls.upVector = up
  
  controls.userPanSpeed = controlsData.panSpeed
  controls.userZoomSpeed = controlsData.zoomSpeed
  controls.userRotateSpeed = controlsData.rotateSpeed

  controls.autoRotate = controlsData.autoRotate.enabled
  controls.autoRotateSpeed = controlsData.autoRotate.speed
  
  return controls
}

/*create a light instance from the provided data*/
export function makeLight( lightData ){
  let light = undefined
  const DEFAULTS ={
    color:"#FFF",
    intensity:1,
    pos: [0,0,0]
  }
  lightData = Object.assign({}, DEFAULTS, lightData)

  switch(lightData.type){
    case "light":
       light = new THREE.Light(lightData.color)
       light.intensity = lightData.intensity
    break
    case "hemisphereLight":
      light = new THREE.HemisphereLight(lightData.color, lightData.gndColor, lightData.intensity)
    break
    case "ambientLight":
      // ambient light does not have intensity, only color
      let newColor = new THREE.Color( lightData.color )
      newColor.r *= lightData.intensity
      newColor.g *= lightData.intensity
      newColor.b *= lightData.intensity
      light = new THREE.AmbientLight( newColor )
    break
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
      }
      lightData = Object.assign({}, dirLightDefaults, lightData)
      light = new THREE.DirectionalLight( lightData.color, lightData.intensity )
      for(var key in lightData) {
        if(light.hasOwnProperty(key)) {
          light[key] = lightData[key]
        }
      }

    break
    default:
      throw new Error("could not create light")
    break
  }

  light.position.fromArray( lightData.pos )

  return light
}


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