import Rx from 'rx'
const merge = Rx.Observable.merge
const of = Rx.Observable.of
const scase = Rx.Observable.case

import {exists,getExtension,getNameAndExtension,isValidFile} from './utils'

import postProcessMesh from './meshUtils'
import helpers         from 'glView-helpers'
const centerMesh         = helpers.mesthTools.centerMesh

import {equals, cond, T, always} from 'ramda'
import {combineLatestObj} from './obsUtils'
import {mergeData} from './modelUtils'
import StlParser    from 'usco-stl-parser'

import assign from 'fast.js/object/assign'//faster object.assign


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
    .map(function(data){
      const source     = dataSource(data)
      const uri        = source.uri
      const {name,ext} = getNameAndExtension(uri)
      return {src:source.src, uri, data, ext, name}
    })
    .filter(function(req){
      const cached = cache[req.uri]
      return cached ===undefined
    })

  baseRequest$
    .forEach(e=>console.log("sort of requests",e))

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
  const httpRequests$ = baseRequest$
    .filter(r=>r.src==="http")
    .map(function(req){
      return assign({
        url:req.uri
        ,method:'get'
        ,responseType:'json'
        ,type:'resource'},req)
    })

  //request from desktop store (source only)
  const desktopRequests$ = baseRequest$
    .filter(r=>r.src==="desktop")
    .map(function(req){
      return assign({
        url:req.uri
        ,method:'get'
        ,responseType:'json'
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
  parsers["stl"] = new StlParser()
  return parsers
}
const parsers = makeParsers()


function postProcessParsedData(data){
  let mesh = data 
  mesh = postProcessMesh(mesh)
  mesh = centerMesh(mesh)
  return mesh
}

function fetch(drivers, sourceNames=["http","desktop"]){
  const chosenDrivers = sourceNames
    .map(function(name){
      return drivers[name]
    })

  const fetched$ = merge(...chosenDrivers)
    .filter(res$ => res$.request.type === 'resource')
    .retry(3)
    .catch(function(e){
      console.log("ouch , problem fetching data ",e)
      return Rx.Observable.empty()
    })
    .flatMap(function(e){
      const request  = of( e.request )
      const response = e.pluck("response")
      const progress = e.pluck("progress")
      return combineLatestObj({response,request,progress})
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
    //.do(e=>console.log("parsedA",e))
    .map(function(data){
      const uri = data.request.uri
      const {name,ext} = getNameAndExtension(uri)
      return {uri, data:data.response, ext, name}
    })
    //actual parsing part
    .filter(data=>parsers[data.ext]!==undefined)//does parser exist?
    .flatMap(function({uri, data, ext, name}){
      const parseOptions={useWorker:true,useBuffers:true}

      const deferred = parsers[ext].parse(data, parseOptions)

      const data$  = Rx.Observable.fromPromise(deferred.promise)
        .map(postProcessParsedData) 
      const meta$    = of({uri, ext, name})

      console.log("basics ready")
      return combineLatestObj({meta$,data$})
    })
    .do(e=>console.log("parsed data ready",e))

  return parsed$
}

function computeCombinedFetchProgress(resources$){
  const combinedProgress$ = resources$.scan(function(combined,entry){
    const uri = entry.request.uri
    if(entry.progress || entry.response){
      combined.entries[uri]  = entry.progress || 1

      let totalProgress = Object.keys(combined.entries)
        .reduce(function(acc,cur){
          return acc + combined.entries[cur]
        },0)

      totalProgress /= Object.keys(combined.entries).length
      combined.totalProgress = totalProgress
    }

    return combined
  },{entries:{}})
  .pluck("totalProgress")
  .distinctUntilChanged(null, equals)
  .debounce(10)

  return combinedProgress$
}

/*
       => p =>
  =====       ======>
       => p =>
*/


export function resources(drivers){
 

  const fetched$ = fetch(drivers)
  const parsed$  = parse(fetched$)
  const combinedProgress$ = computeCombinedFetchProgress(fetched$)

  parsed$
    .forEach(e=>console.log("parsed",e))

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




