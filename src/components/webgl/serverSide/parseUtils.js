import THREE from 'three'
const {centerMesh} = meshTools
import { postProcessMesh, geometryFromBuffers } from '../../../utils/meshUtils'
import { meshTools } from 'glView-helpers'


// see http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
export function toArrayBuffer (buffer) {
  var ab = new ArrayBuffer(buffer.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i]
  }
  return ab
}

// TODO: refactor ,same as assetManager/utils
export function postProcessParsedData (data) {
  if ('objects' in data) {

    /* this renderers all objects in black ??
    let wrapper = new THREE.Object3D()
    wrapper.castShadow= false
    wrapper.receiveShadow= false*/

    let mesh
    // for 3mf , etc
    let typesMetaHash = {}
    let typesMeshes = []
    let typesMeta = []

    let mainGeometry = new THREE.Geometry()
    //
    // we need to make ids unique
    let idLookup = {}

    for (let objectId in data.objects) {
      // console.log("objectId",objectId, data.objects[objectId])
      let item = data.objects[objectId]

      /*let meta = {id: item.id, name: item.name}
      // special color handling
      if (item.colors && item.colors.length > 0) {
        meta.color = '#FFFFFF'
      }
      typesMeta.push(meta)
      typesMetaHash[typeUid] = meta*/

      /*mesh = geometryFromBuffers(item)
      mesh = postProcessMesh(mesh)
      mesh = centerMesh(mesh)
      if (item.colors && item.colors.length > 0) {
        mesh.material.color = '#FFFFFF'
      }
      idLookup[item.id] = mesh*/
        //typesMeshes.push({typeUid, mesh})

      mesh = geometryFromBuffers(item)
      mesh = postProcessMesh(mesh)
      idLookup[item.id] = mesh

    }

    data.build.map(function (item) {
      let tgtMesh = idLookup[item.objectid].clone()


      tgtMesh.updateMatrix()
      let geom = new THREE.Geometry().fromBufferGeometry( tgtMesh.geometry )
      mainGeometry.merge(geom, tgtMesh.matrix)

      //wrapper.add(tgtMesh)

      /*instMeta.push({instUid, typeUid: id}) // TODO : auto generate name
      if ('transforms' in item) {
        instTransforms.push({instUid, transforms: item.transforms})
      } else {
        instTransforms.push({instUid, transforms: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]})
      }*/
    })

    //mesh = postProcessMesh(mainGeometry)
    let material = new THREE.MeshPhongMaterial({ color: 0x17a9f5, specular: 0xffffff, shininess: 5, shading: THREE.FlatShading })

    mesh = new THREE.Mesh(mainGeometry, material)
    mesh = centerMesh(mesh)
    mesh.geometry.computeFaceNormals()
    mesh.geometry.computeVertexNormals() // n
    return mesh// wrapper // .children[0]

  }else{
    let mesh = data
    mesh = geometryFromBuffers(mesh)
    mesh = postProcessMesh(mesh)
    mesh = centerMesh(mesh)
    return mesh
  }
}
