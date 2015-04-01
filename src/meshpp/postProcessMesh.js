import THREE from "three"
//TODO: UNIFY api for parsers, this is redundant
let postProcess = function( resource ){

  //geometry
  var shape = resource.data;
  if( !(shape instanceof THREE.Object3D) )
  {
    var material = new THREE.MeshPhongMaterial( { color: 0x17a9f5, specular: 0xffffff, shininess: 5, shading: THREE.FlatShading} );
    shape = new THREE.Mesh(shape, material);
  }

  //FIXME ; should this be handled by the asset manager or the parsers ? 
  //ie , this won't work for loaded hierarchies etc
  var geometry = shape.geometry;
  if(geometry)
  {
    geometry.computeVertexNormals();//needed at least for .ply files
    geometry.computeFaceNormals();
  }

  //Additional hack, only for buffer geometry
  if(!geometry.morphTargets) geometry.morphTargets=[];
  if(!geometry.morphNormals) geometry.morphNormals=[];
  return shape;
}

export default postProcess