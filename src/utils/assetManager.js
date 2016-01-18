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


function dataSource(data){
  if(isValidFile(data)){
    return {
      src:'desktop'
      ,uri: data.name
    }
  }
  else{
    return {
      src:'http'
      ,uri:data
    }
  }
}

export function requests(inputs, drivers){
  const {meshSources$,srcSources$} = inputs

  //FIXME: caching should be done at a higher level , to prevent useless requests
  const resourceCache$ = undefined
  const cache = {}
  function getCached({meshSources$,srcSources$}){
    //this one needs to be store independant too
  }

  const baseRequest$ = merge(
      meshSources$
      ,srcSources$
    )
    .flatMap(Rx.Observable.fromArray)
    .filter(exists)
    .filter(data=>!isEmpty(data))
    .map(function(data){
      const source     = dataSource(data)
      const uri        = source.uri
      const {name,ext} = getNameAndExtension(uri)
      return {src:source.src, uri, data, ext, name}
    })

  //baseRequest$
  //  .forEach(e=>console.log("sort of requests",e))

  const requests$ = baseRequest$
    .filter(function(req){
      const cached = cache[req.uri]
      return cached ===undefined
    })

  /*const results$ = merge(
      fetch(drivers)
      //TODO: merge with cached results
    )*/

  //

  /*const request  = of( e.request )
      const response = e.pluck("response")
      const progress = e.pluck("progress")
      return combineLatestObj({response,request,progress})*/

  /*var sources = {
    'desktop': of("desktop"),
    'http': of("bar")
  }
  var source = Rx.Observable.case(
    function(){
      return 'http'
    }
    ,sources)
    .forEach(e=>console.log("testing",e))*/

  // request from http driver 
  const httpRequests$ = requests$
    .filter(r=>r.src==="http")
    .map(function(req){
      return assign({
        url:req.uri
        ,method:'get'
        ,type:'resource'},req)
    })


  //request from desktop store (source only)
  const desktopRequests$ = requests$
    .filter(r=>r.src==="desktop")
    .map(function(req){
      return assign({
        url:req.uri
        ,method:'get'
        ,type:'resource'},req)
    })

  const requests = {
    http$:httpRequests$
    ,desktop$:desktopRequests$
  }

  return {
    requests 
  }
}




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
  console.log("postProcessMesh",data)
  let mesh = undefined
  if("objects" in data){
    //for 3mf , etc
    console.log("data",data)
    mesh = data.objects['1']
    mesh = geometryFromBuffers(mesh)
    mesh = postProcessMesh(mesh)
    mesh = centerMesh(mesh)

  }else{
    mesh = data 
    mesh = geometryFromBuffers(mesh)
    mesh = postProcessMesh(mesh)
    mesh = centerMesh(mesh)
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
      const parseOptions = {useWorker:false}

      const parse    = parsers[ext]
      const parsedObs$ = parse(data, parseOptions)
        //.do(e=>console.log("parsing data",e))
        .doOnError(e=>console.log("error in parse",e))

      const data$  = parsedObs$
        .filter(e=>e.progress === undefined)//seperate out progress data
        .map(postProcessParsedData) 

      const progress$ = parsedObs$
        .filter(e=>e.progress !== undefined)//keep ONLY progress data
        .pluck("progress")
        .distinctUntilChanged()
        .startWith(0)

      const meta$    = of({uri, ext, name})

      return combineLatestObj({meta$, data$, progress$})
    })
    .shareReplay(1)
    //.do(e=>console.log("parsed data ready",e))

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

/*
function makeAssetManager(drivers){

}


function load(fileUri, options){
  const defaults = {
    parentUri   :undefined
    ,transient  :false
    ,keepRawData:false
    ,parse      :true

    ,fetchOptions:{}
    ,parseOptions:{}
  }
  options = mergeData(options,defaults)


  input
    .filter(exists)

  if (fileUri == null) {
    error = "Invalid file name : " + fileUri
  }

  input
    .filter(isValidFile)
    .map(function(){
      //we have been given a file , or file like structure, default store to desktop ?
      [storeName,filename] = ["desktop", fileUri.name]
      file = fileUri
      _file = fileUri
      fileUri = fileUri.name
    })

  input
    .filter(!isValidFile)
    .map(function(){
      fileUri = pathUtils.toAbsoluteUri(fileUri, parentUri)
      [storeName,filename] = pathUtils.parseFileUri(fileUri, parentUri)
    })
    

  log.info("Attempting to load :", filename, "from store:", storeName)

  let resource = {
    ext:"foo"
    ,file:_file//FIXME a bit of a hack: for future uploads we keep the original file?
  }

  //the resource was already loaded, return it 
  if (filename in this.assetCache){
    log.info("resource already in cache, returning cached version")
    resource = this.assetCache[filename]
    return resource
  }

  //not cached 
  store = this.stores[storeName]
  if (!store) {
    error = new Error("No store named " + storeName)
    error.name = "storeNotFoundError"
  }
  
  //get parser instance , if it exists
  parser = this.parsers[extension]
  if (!parser) {
    error = new Error("No parser found for '" + extension + "' file format")
    error.name = "parserNotFoundError"
  }


  //if extension not in @codeExtensions
  //get prefered input data type for parser/extension
  //FIXME: do this more elegantly 

  fileOrFileName = storeName === "desktop" ? file : filename//if desktop, then file, else fileName
  
  function getRawData(){
    //get raw data (not parsed)
    //returns observable
    return store.read(fileOrFileName, {
      dataType: parser.inputDataType
    })
  }   

  function parseRawData(rawData){
    //returns observable
    return parser.parse(rawData, parseOptions)
  }

  function onSuccess(loadedResource) 
    resource.fetched = true

    obs.onNext({
      parsing:0
    })
   
    resource.rawData = keepRawData ? loadedResource : null
    resource.data = loadedResource
    resource.loaded = true
    if (!transient) {
      assetCache[fileUri] = resource
    }
  }
                      
  function onProgress = function(progress) {
    log.debug("got some progress", JSON.stringify(progress))
    if ("fetching" in progress) {
      resource.fetchProgress = progress.fetching
    }
    if ("parsing" in progress) {
      resource.parseProgress = progress.parsing
    }
    deferred.notify(progress)
    resource.size = progress.total
  }

  function onError( error ){
    log.error("failure in data reading step", error)
    error = new Error(error.message)
    fetchError.name = "fetchError"
  }

  //load raw data from uri/file, get an observable
  rawDataDeferred.promise.then( onSuccess, onError, onProgress)
  
  return obs

}
*/




