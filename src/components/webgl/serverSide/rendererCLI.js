import view from '../view'
import fs from 'fs'

import stlParser from 'usco-stl-parser'
import objParser from 'usco-obj-parser'
import ctmParser from 'usco-ctm-parser'
import threeMfParser from 'usco-3mf-parser'

import {getNameAndExtension} from '../../../utils/utils'
import {postProcessParsedData, toArrayBuffer} from './parseUtils'

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
    'ctm': ctmParser,
    '3mf': threeMfParser
  }

  let data = fs.readFileSync(uri, 'binary')
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
