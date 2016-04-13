import view from './view'
import Rx from 'rx'
import fs from 'fs'

// BIG hack, because parsers are browserified modules ...
// global.Rx = Rx
// const stlParser = require('imports?Rx=rx!usco-stl-parser')
// const objParser = require('imports?Rx=rx!usco-obj-parser')

const stlParser = require('usco-stl-parser')
const objParser = require('usco-obj-parser')
// import * as stlParser from 'usco-stl-parser'
// import * as objParser from 'usco-obj-parser'

import { getNameAndExtension } from '../../utils/utils'
import { postProcessMesh, geometryFromBuffers } from '../../utils/meshUtils'
import { meshTools } from 'glView-helpers'
const {centerMesh} = meshTools

// TODO: refactor ,same as assetManager
function postProcessParsedData (data) {
  let mesh = data
  mesh = geometryFromBuffers(mesh)
  mesh = postProcessMesh(mesh)
  mesh = centerMesh(mesh)
  return mesh
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
console.log('args', args)

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

  const {ext} = getNameAndExtension(uri)
  const resolution = {width, height}
  const outputPath = `${uri}.png`

  console.log('Running renderer with params', uri, resolution, outputPath)

  let parsers = {}
  parsers['stl'] = stlParser.default
  parsers['obj'] = objParser.default

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
