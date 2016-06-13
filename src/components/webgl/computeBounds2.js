import THREE from 'three'

// FIXME : very temporary , until moving to regl/gl-matrix

export function computeBoundingBox (object, children, force) {
  var force = force === undefined ? false : force

  if (object.geometry === undefined) {
    var bbox = new THREE.Box3()
  } else {
    if ((! object.geometry.boundingBox) || force) {
      object.geometry.computeBoundingBox()
    }
    var bbox = object.geometry.boundingBox.clone()
  }

  children.forEach(function(rootChild){
    rootChild.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        if (child.geometry !== undefined) {
          if ((! child.geometry.boundingBox) || force) {
            child.geometry.computeBoundingBox()
          }
          var childBox = child.geometry.boundingBox.clone()
          childBox.translate(child.localToWorld(new THREE.Vector3()))
          bbox.union(childBox)
        }
      }
    })
  })

  object.boundingBox = bbox
  return bbox
}

export function computeBoundingSphere (object, children, force) {
  var bbox = new THREE.Box3().setFromObject(object)

  if (object.boundingBox) object.boundingBox.copy(bbox)
  if (!object.boundingBox) object.boundingBox = bbox
  const boundingSphere = bbox.getBoundingSphere()
  return boundingSphere
}
