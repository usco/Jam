import THREE from "three"

//TODO: UNIFY api for parsers, this is redundant
export function postProcessMesh( shape ){

  //geometry
  if( !(shape instanceof THREE.Object3D) )
  {
    let material = new THREE.MeshPhongMaterial( { color: 0x17a9f5, specular: 0xffffff, shininess: 5, shading: THREE.FlatShading} )
    shape = new THREE.Mesh(shape, material)
  }

  //FIXME  should this be handled by the asset manager or the parsers ? 
  //ie , this won't work for loaded hierarchies etc
  let geometry = shape.geometry
  if(geometry)
  {
    geometry.computeVertexNormals()//needed at least for .ply files
    geometry.computeFaceNormals()
  }

  //Additional hack, only for buffer geometry
  if(!geometry.morphTargets) geometry.morphTargets=[]
  if(!geometry.morphNormals) geometry.morphNormals=[]
  return shape
}


export function geometryFromBuffers({vertices,normals}){
  var geometry = new THREE.BufferGeometry()
  geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) )
  geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) )
  return geometry
}
