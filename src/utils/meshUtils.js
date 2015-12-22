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

  /* OLD STUFF, needs to be sorted out 
    var vs = require('./vertShader.vert')();
    var fs = require('./fragShader.frag')();

    var material = new THREE.RawShaderMaterial( {
            uniforms: {
              time: { type: "f", value: 1.0 }
            },
            vertexShader: vs,
            fragmentShader: fs,
            side: THREE.DoubleSide,
            transparent: true

          } );
    var material = new this.defaultMaterialType({color:color, specular: 0xffffff, shininess: 2, shading: THREE.FlatShading});//,vertexColors: THREE.VertexColors
  */



  //Additional hack, only for buffer geometry
  if(!geometry.morphTargets) geometry.morphTargets=[]
  if(!geometry.morphNormals) geometry.morphNormals=[]
  return shape
}


export function geometryFromBuffers({positions,normals,indices,colors}){
  let geometry = new THREE.BufferGeometry()

  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) )
  geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) )
  
  if(indices){
    geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) )
  }
  if(colors){
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 1 ) )
  }

  return geometry
}


//import Hashes from 'jshashes'
export function meshTohash(mesh){
  //let SHA512 = new Hashes.SHA512
  //geometry.vertices
  //for each mesh , compute /update hash based on vertices
  const modelHash = hash.hex()
  return modelHash
}
