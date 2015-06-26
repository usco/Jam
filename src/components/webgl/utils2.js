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
  let intersect = event.detail.pickingInfos.shift() //we actually only get the best match
  if(intersect && intersect.object) {
    mesh = findSelectionRoot(intersect.object)//now we make sure that what we have is actually selectable
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
  let cameraData = Object.assign({}, DEFAULTS, cameraData)


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

  let controlsData = controlsData//TODO: merge with defaults using object.assign
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
  let lightData = Object.assign({}, DEFAULTS, lightData)

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

//for annotations, overlays etc
export function makeMeta(data, style)
{
  //console.log("drawing metadata",data)

  let annotStyle = {
    crossColor:"#000",
    textColor:"#000",
    lineColor:"#000",
    arrowColor:"#000",
    lineWidth:2.2,

    highlightColor: "#60C4F8",//"#00F",
    fontFace:"Open Sans"
  }

  return data
    .map(function(entry){
      let visual = undefined
      if(entry.typeUid === "0"){
        console.log("note annot",entry)

        let point = entry.target.point
        let entity = data.filter(function(data){return data.iuid === entry.target.iuid})
        entity = entity.pop()

        if(!entity) return
        let mesh = __localCache[entity.iuid]
        if(!mesh) return

        //mesh.updateMatrix()
        //mesh.updateMatrixWorld()
        let pt = new THREE.Vector3().fromArray(point)//.add(mesh.position)
        pt = mesh.localToWorld(pt)

        let params = {
          point:pt,
          object:mesh}
        params = Object.assign(params,annotStyle)
        
        visual = new annotations.NoteVisual(params)

        //dynamicInjector.add(visual)
        /*visual.applyMatrix( dynamicInjector.matrixWorld )
        let matrixWorldInverse = new THREE.Matrix4()
        matrixWorldInverse.getInverse( mesh.matrixWorld )
        visual.applyMatrix( matrixWorldInverse )*/
      }
      if(entry.typeUid === "1"){
        //Thickness
        let entity = data.filter(function(data){return data.iuid === entry.target.iuid})
        entity = entity.pop()

        if(!entity) return
        let mesh = __localCache[entity.iuid]
        if(!mesh) return

        let entryPoint = entry.target.entryPoint
        let exitPoint  = entry.target.exitPoint
                      
        entryPoint= new THREE.Vector3().fromArray(entryPoint)//.add(mesh.position)
        exitPoint = new THREE.Vector3().fromArray(exitPoint)

        entryPoint = mesh.localToWorld(entryPoint)
        exitPoint = mesh.localToWorld(exitPoint)

        let params = {
          entryPoint,
          exitPoint,
          object:mesh
        }
        params = Object.assign(params,annotStyle)
        visual = new annotations.ThicknessVisual(params)

      }

      if(entry.typeUid === "2"){
        //distance
        let start = entry.target.start
        let startEntity = data.filter(function(data){return data.iuid === start.iuid})
        startEntity = startEntity.pop()

        let end = entry.target.end
        let endEntity = data.filter(function(data){return data.iuid === end.iuid})
        endEntity = endEntity.pop()

        if(!startEntity || !endEntity) return

        let startMesh = __localCache[startEntity.iuid]
        let endMesh   = __localCache[endEntity.iuid]
        if( startMesh && endMesh ){
          let startPt = new THREE.Vector3().fromArray(start.point)
          let endPt   = new THREE.Vector3().fromArray(end.point)
          
          startMesh.localToWorld(startPt)
          endMesh.localToWorld(endPt)
          //startMesh.worldToLocal(startPt)
          //endMesh.worldToLocal(endPt)

          let params = {
            start:startPt,
            startObject:startMesh,
            end: endPt,
            endObject: endMesh
          }
          params = Object.assign(params, annotStyle)

          visual = new annotations.DistanceVisual(params)
        }            
      }


      if(entry.typeUid === "3"){
        //diameter
        console.log("diameter annot",entry)

        let point = entry.target.point
        let entity = data.filter(function(data){return data.iuid === entry.target.iuid})
        entity = entity.pop()

        if(!entity) return
        let mesh = __localCache[entity.iuid]
        if(!mesh) return

        //mesh.updateMatrix()
        //mesh.updateMatrixWorld()
        point        = new THREE.Vector3().fromArray(point)
        let normal   = new THREE.Vector3().fromArray(entry.target.normal)
        let diameter = entry.value
       
        if(!entity) return

        point = mesh.localToWorld(point)


        let params = {
           center:point,
           diameter,
           orientation:normal
        }
        params = Object.assign(params,annotStyle)

        visual = new annotations.DiameterVisual(params)
    
        /*let matrixWorldInverse = new THREE.Matrix4()
        matrixWorldInverse.getInverse( mesh.matrixWorld )
        visual.applyMatrix( matrixWorldInverse )*/

        //mesh.updateMatrix()
        //mesh.updateMatrixWorld()
        //

        //let matrixWorldInverse = new THREE.Matrix4()
        //matrixWorldInverse.getInverse( dynamicInjector.matrixWorld )

        //visual.applyMatrix( matrixWorldInverse )


        /*let m = new THREE.Matrix4()
        m.multiplyMatrices( mesh.matrixWorld, visual.matrix)
        visual.applyMatrix(m)
        visual.matrixWorld.multiplyMatrices( mesh.matrixWorld, visual.matrix )*/

        //visual.matrixWorld.multiplyMatrices( mesh.matrixWorld, visual.matrix )//WORKS
        //visual.applyMatrix( mesh.matrixWorld )
      }

      if(visual){
        visual.userData.entity = entry
        dynamicInjector.add( visual )
      }

      //FIXME: solve selection 
      /*if(visual && selectedEntities.indexOf(entry.iuid)>-1){
        visual.highlight(true)
      }*/
      return visual
    })
}