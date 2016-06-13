import THREE from 'three'

export default function zoomToFitBounds (object, camera, target) {
  let bbox = object.boundingBox
  if (bbox.empty()) {
    return
  }

  target = bbox.center()

  const radius = object.boundingSphere.radius
  const center = object.boundingSphere.center
  const targetOffset = new THREE.Vector3().subVectors(center, camera.target)

  // move camera to base position
  camera.position.add(targetOffset)
  camera.target.copy(center)

  // and move it away from the boundingSphere of the object
  let vec = new THREE.Vector3()
  vec.subVectors(camera.position, camera.target)
  vec.normalize()
  vec.setLength(center.distanceTo(camera.position) - radius * 4)
  camera.position.sub(vec)

  camera.updateProjectionMatrix()
}
