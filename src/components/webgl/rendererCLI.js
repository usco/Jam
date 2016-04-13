import view from './view'
import fs from 'fs'
import THREE from 'three'

import stlParser from 'usco-stl-parser'
import objParser from 'usco-obj-parser'
import threeMfParser from 'usco-3mf-parser'

import { getNameAndExtension } from '../../utils/utils'
import { postProcessMesh, geometryFromBuffers } from '../../utils/meshUtils'
import { meshTools } from 'glView-helpers'
const {centerMesh} = meshTools

// TODO: refactor ,same as assetManager
function postProcessParsedData (data) {
  console.log('bla', data)
  if ('objects' in data) {
    let wrapper = new THREE.Object3D()
    wrapper.castShadow= false
    wrapper.receiveShadow= false

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

// see http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
function toArrayBuffer (buffer) {
  var ab = new ArrayBuffer(buffer.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i]
  }
  return ab
}

// ///////deal with command line args etc
let args = process.argv.slice(2)

if (args.length > 0) {
  // more advanced params handling , for later
  /*
    console.log("params",args)
    let params = args.reduce(function(cur,combo){
    let [name,val]= cur.split("=")
    combo[name] = val
  },{})*/

  const uri = args[0]
  const [width, height] = args[1].split('x').map(e => parseInt(e, 10))
  const outputPath = args[2] ? args[2] : `${uri}.png`

  const {ext} = getNameAndExtension(uri)
  const resolution = {width, height}

  console.log('outputPath', outputPath, 'ext', ext)

  console.log('Running renderer with params', uri, resolution, outputPath)

  const parsers = {
    'stl': stlParser,
    'obj': objParser,
    '3mf': threeMfParser
  }

  const data = toArrayBuffer(fs.readFileSync(uri))
  const parse = parsers[ext]
  const parseOptions = {}
  const parsedObs$ = parse(data, parseOptions)

  parsedObs$
    .filter(e => e.progress === undefined) // seperate out progress data
    .map(postProcessParsedData)
    .forEach(mesh => {
      view({mesh, uri: outputPath, resolution}) // each time some data is parsed, render it
    })
}
