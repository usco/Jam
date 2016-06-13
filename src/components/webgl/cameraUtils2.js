import THREE from 'three'

export default function zoomToFitBounds (object, camera, target) {
  let bbox = object.boundingBox
  if (bbox.empty()) {
    return
  }
  let COG = bbox.center()

  //pointCameraTo(COG, target, camera)
  //camera.lookAt(COG)

  /*let sphereSize = object.boundingSphere.radius // bbox.size().length() * 0.5
  let distToCenter = sphereSize / Math.sin(Math.PI / 180.0 * camera.fov * 0.5)
*/
  // move the camera backward

  console.log('bbbox',bbox.center())
  target = bbox.center()
  //let vec = new THREE.Vector3()
  // compute vector from cam position to target
  //vec.subVectors(camera.position, target)
  // set that vector's length to the distance to the center
  //vec.setLength(distToCenter)
  // offset camera position by offset distance + target
  //camera.position.addVectors(vec , target)

  const height = 100

  const correctForDepth = 1.7
  const radius =  object.boundingSphere.radius
  const center =  object.boundingSphere.center
  const distance = height / 2 / Math.tan(Math.PI * fov / 360)//center.distanceTo(camera.position) - radius
  const offset = new THREE.Vector3().subVectors(center, camera.position)
  const targetOffset = new THREE.Vector3().subVectors(center, camera.target)


  var realHeight = Math.abs(bbox.max.y - bbox.min.y)
  var fov = 2 * Math.atan(realHeight * correctForDepth / ( 2 * distance )) * ( 180 / Math.PI )
  //camera.fov = fov

  //move camera
  console.log('offset',targetOffset)
  camera.position.add(targetOffset)
  camera.target.copy(center)

  camera.updateProjectionMatrix()

// possible api change, to have function return data instead of mutating anything
/*vec.addVectors(vec, target)

return {COG,offset:vec}

//in other function ??
pointCameraTo(COG, target, camera)
camera.lookAt(COG)*/
}

/**
 * point the current camera to the center
 * of the graphical object (zoom factor is not affected)
 *
 * the camera is moved in its  x,z plane so that the orientation
 * is not affected either
 */
export function pointCameraTo (COG, target, camera) {
  // Refocus camera to the center of the new object
  let v = new THREE.Vector3()
  v.subVectors(COG, target)

  camera.position.addVectors(camera.position, v)
}

// non mutating
export function positionOfCameraPointedTo (COG, target, camera) {
  // Refocus camera to the center of the new object
  let v = new THREE.Vector3()
  v.subVectors(COG, target)

  return camera.position.clone().addVectors(camera.position, v)
}
