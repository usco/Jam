import view from './view'
import Rx from 'rx'
import fs from 'fs'

//BIG hack, because parsers are browserified modules ...
global.Rx = Rx
const stlParser = require("imports?Rx=rx!usco-stl-parser")
const objParser = require("imports?Rx=rx!usco-obj-parser")
//import * as stlParser from 'usco-stl-parser'
//import * as objParser from 'usco-obj-parser'


import {exists,getExtension,getNameAndExtension,isValidFile, isEmpty} from '../../utils/utils'
import {postProcessMesh,geometryFromBuffers} from '../../utils/meshUtils'
import {meshTools} from 'glView-helpers'
const centerMesh         = meshTools.centerMesh

//TODO: refactor ,same as assetManager
function postProcessParsedData(data){
  let mesh = data 
  mesh = geometryFromBuffers(mesh)
  mesh = postProcessMesh(mesh)
  mesh = centerMesh(mesh)
  return mesh
}

/*import makeHttpDriver     from '../../core/drivers/simpleHttpDriver'
import {requests,resources} from '../../utils/assetManager'
let httpDriver   = makeHttpDriver()*/


//see http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i]
  }
  return ab
}


/////////deal with command line args etc
let args = process.argv.slice(2)


if(args.length>0){

  
  //more advanced params handling , for later
  /*
    console.log("params",args)
    let params = args.reduce(function(cur,combo){
    let [name,val]= cur.split("=")
    combo[name] = val
  },{})*/

  const uri = args[0]
  const [width,height] = args[1].split("x").map(e=>parseInt(e))

  const {name,ext} = getNameAndExtension(uri)
  const resolution = {width,height}
  const outputPath = `${uri}.png`

  console.log("Running renderer with params", uri,resolution,outputPath)

  let parsers = {}
  parsers["stl"] = stlParser.default
  parsers["obj"] = objParser.default

  const data         = toArrayBuffer( fs.readFileSync(uri) )
  const parse        = parsers[ext]
  const parseOptions = {}
  const parsedObs$   = parse(data, parseOptions)

  const data$  = parsedObs$
    .filter(e=>e.progress === undefined)//seperate out progress data
    .map(postProcessParsedData)
    .forEach(mesh => {
      view({mesh,uri:outputPath,resolution})
    })
    
  /*let uris = args
  const requests$ = Rx.Observable.from(uris)
   .map(function(uri){
      return {
        url:uri
        ,method:'get'
        ,type:'resource'
      }
    })

  const responses$ = httpDriver(requests$)
    responses$
      .forEach(e=>console.log("responses",e))
  //resources()*/
}

