import Rx from 'rx'
const merge = Rx.Observable.merge
const of = Rx.Observable.of
const scase = Rx.Observable.case

import {exists,getExtension,getNameAndExtension,isValidFile, isEmpty} from './utils'

import {postProcessMesh,geometryFromBuffers} from './meshUtils'
import {meshTools} from 'glView-helpers'
const centerMesh         = meshTools.centerMesh

import {equals, cond, T, always} from 'ramda'
import {combineLatestObj} from './obsUtils'
import {mergeData} from './modelUtils'
import assign from 'fast.js/object/assign'//faster object.assign

//import parse as stlParser,  {outputs} from 'stlParser'
import * as stlParser from 'usco-stl-parser'
import * as objParser from 'usco-obj-parser'
import * as threemfParser from 'usco-3mf-parser'


function makeParsers(){
  //other
  let parsers = {}
  parsers["stl"] = stlParser.default
  parsers["obj"] = objParser.default
  parsers["3mf"] = threemfParser.default
  //console.log(".inputDataType",parsers["stl"].inputDataType)
  return parsers
}
const parsers = makeParsers()


function postProcessParsedData(data){
  //TODO: unify parsers' returned data/api
  console.log("postProcessMesh/data",data)
  let mesh = undefined
  if("objects" in data){
    //for 3mf , etc
    console.log("data",data)
    mesh = data.objects['1']
    mesh = geometryFromBuffers(mesh)
    mesh = postProcessMesh(mesh)
    mesh = centerMesh(mesh)

    let typesMetaHash = {}
    let typesMeshes   = []
    let typesMeta = []
    for(let objectId in data.objects){
      //console.log("objectId",objectId, data.objects[objectId])
      let item  = data.objects[objectId]
      

      let meta = {id:item.id, name:item.name}
      typesMeta.push(meta)
      typesMetaHash[item.id] = meta

      mesh = geometryFromBuffers(item)
      mesh = postProcessMesh(mesh)
      mesh = centerMesh(mesh)
      typesMeshes.push({id:item.id, mesh})
    }

    //now for the instances data
    let instMeta = []
    let instTransforms = []
    data.build.map(function(item,index){

      instMeta.push( { instUid:index, typeUid: typesMetaHash[item.objectid].id} )//TODO : auto generate name
      if('transforms' in item ){
        instTransforms.push({instUid:index, transforms:item.transforms})
      }
    })
    console.log("typesMeta",typesMeta,"instMeta",instMeta,"instTransforms",instTransforms)

    return {typesMeshes, typesMeta, instMeta ,instTransforms}

  }else{
    mesh = data 
    mesh = geometryFromBuffers(mesh)
    mesh = postProcessMesh(mesh)
    mesh = centerMesh(mesh)

    let typesMeshes   = [{id:undefined, mesh}]

    return {typesMeshes}
  }
  
  return mesh
}

function fetch(drivers, sourceNames=["http","desktop"]){
  const chosenDrivers = sourceNames
    .map(function(name){
      return drivers[name]
    })

  const fetched$ = merge(...chosenDrivers)
    .filter(res$ => res$.request.type === 'resource')
    .flatMap(data => {
      const responseWrapper$ = data.catch(e=>{
        console.log("caught error in fetching data",e)
        return Rx.Observable.empty()
      })
      const request$  = of(data.request)
      const response$ = responseWrapper$.pluck("response")
      const progress$ = responseWrapper$.pluck("progress")

      return combineLatestObj({response$, request$, progress$})//.materialize()//FIXME: still do not get this one
    })
    .share()


  return fetched$
}

function parse(fetched$){
  const parseBase$ = fetched$
    .filter(data=>(data.response !== undefined && data.progress === undefined))
    .distinctUntilChanged(d=>d.request.uri,equals)
    //.debounce(10)
    .shareReplay(1)

  const parsed$ = parseBase$
    .map(function(data){
      const uri = data.request.uri
      const {name,ext} = getNameAndExtension(uri)
      return {uri, data:data.response, ext, name}
    })
    //actual parsing part
    .filter(data=>parsers[data.ext]!==undefined)//does parser exist?
    .flatMap(function({uri, data, ext, name}){
      const parseOptions = {useWorker:true}

      const parse    = parsers[ext]
      const parsedObs$ = parse(data, parseOptions)
        //.do(e=>console.log("parsing data",e))
        .doOnError(e=>console.log("error in parse",e))

      const data$  = parsedObs$
        .filter(e=> e.progress === undefined)//seperate out progress data
        .map(postProcessParsedData) 

      const progress$ = parsedObs$
        .filter(e=> e.progress !== undefined)//keep ONLY progress data
        .pluck("progress")
        .distinctUntilChanged()
        .startWith(0)

      const meta$    = of({uri, ext, name})

      return combineLatestObj({meta$, data$, progress$})
    })
    .shareReplay(1)

  return parsed$
}

function computeCombinedProgress(fetched$, parsed$){
  const fetchToParseRatio = 0.95

  function preProcess(selector,data$){
    return data$
      .map(selector)
      .distinctUntilChanged()
      .filter(d=>exists(d.progress))
  }

  //we merge fetch information with parse information
  const progress$ = merge(
    preProcess(f=>({id:f.request.uri,progress:f.progress}), fetched$)
      .map(e=>({id:e.id, fetched:e.progress*fetchToParseRatio}))

    ,preProcess(f=>({id:f.meta.uri,progress:f.progress}), parsed$)
      .map(e=>({id:e.id, parsed:e.progress*(1-fetchToParseRatio)}))
  )

  const combinedProgress$ = progress$.scan(function(combined,entry){
    const fetched  = entry.fetched || fetchToParseRatio
    const parsed   = entry.parsed || 0
    const progress = fetched + parsed

    combined.entries[entry.id]  = progress

    let totalProgress = Object.keys(combined.entries)
      .reduce(function(acc,cur){
        return acc + combined.entries[cur]
      },0)

    totalProgress /= Object.keys(combined.entries).length
    combined.totalProgress = totalProgress

    return combined
  },{entries:{},totalProgress:0})
  .pluck("totalProgress")
  .distinctUntilChanged(null, equals)
  .debounce(10)

  return combinedProgress$
}


export function resources(drivers){
  const fetched$ = fetch(drivers)
  const parsed$  = parse(fetched$)
  const combinedProgress$ = computeCombinedProgress( fetched$, parsed$ )

  return {
    combinedProgress$
    , parsed$
  }
}

  /*const fn = cond([
    [equals(0),   always('water freezes at 0°C')],
    [equals(100), always('water boils at 100°C')],
    [T,           temp => 'nothing special happens at ' + temp + '°C']
  ])

  console.log( fn(0) ) //=> 'water freezes at 0°C'
  console.log( fn(50) ) //=> 'nothing special happens at 50°C'
  console.log( fn(100) ) //=> 'water boils at 100°C'*/

