import Rx from 'rx'
const merge = Rx.Observable.merge
const of = Rx.Observable.of
const scase = Rx.Observable.case

import {exists,getExtension,getNameAndExtension,isValidFile, isEmpty} from './utils'

import {equals, cond, T, always} from 'ramda'
import {combineLatestObj} from './obsUtils'
import {mergeData} from './modelUtils'
import assign from 'fast.js/object/assign'//faster object.assign

import {postProcessParsedData} from './parseUtils'


function getParser(extension){
  return lazyLoad(extension)
}

function lazyLoad(moduleNamePath){

  let obs = new Rx.ReplaySubject(1)
  //let waitForChunk = require('dynamic?' + moduleNamePath)

    //require("bundle?lazy!usco-ctm-parser")(function(module) {
    //const requireStr = `bundle?lazy!./node_modules/${moduleNamePath}`
    //const requireStr = `bundle?lazy!./`
    //let req = require.context("./node-modules", true, /^\.\/.*\.jade$/)
    //const requireStr = `bundle?lazy!./node_modules/${moduleNamePath}/lib/ctm-parser.js`

    //var req = require.context('../../node_modules', true, /^\.\/.*\.js$/)

    /*require.ensure(['usco-ctm-parser'], function(require) {
      //require('usco-ctm-parser')
      let module = require(moduleNamePath)
      console.log("dynamic load of module",module)
      //obs.onNext(module)
    })*/
    /*require(requireStr)(function(module) {
      // now you can use the b-module
      console.log("dynamic load of module",module)
      obs.onNext(module)
    })*/
    //System.import('usco-ctm-parser').then(module=>console.log("module",module))

    //FIXME: awfull, horrible horrrible horrible
    //NOTE : chunk names can be specified like this : &name=stl-parser
    switch(moduleNamePath){
      case 'stl':
        require("bundle?lazy!usco-stl-parser")(module => obs.onNext(module))
      break
      case 'ctm':
        require("bundle?lazy!usco-ctm-parser")(module => obs.onNext(module))
      break
      case 'obj':
        require("bundle?lazy!usco-obj-parser")(module => obs.onNext(module))
      break
      case '3mf':
        require("bundle?lazy!usco-3mf-parser")(module => obs.onNext(module))
      break
    }
  return obs
}

//this functions extracts data recieved from sources, adds error handling etc
function fetch(sources, sourceNames=["http","desktop"]){
  const chosenSources = sourceNames
    .map(function(name){
      return sources[name]
    })

  const fetched$ = merge(...chosenSources)
    .filter(res$ => res$.request.type === 'resource')//only responses we deal with are resources
    .flatMap(data => {
      const responseWrapper$ = data.catch(e=>{
        console.log("caught error in fetching data",e)
        return Rx.Observable.empty()
      })
      const request$  = of(data.request)
      const response$ = responseWrapper$.pluck("response")
      const progress$ = responseWrapper$.pluck("progress")

      return combineLatestObj({response$, request$, progress$})
    })
    .share()
  return fetched$
}

//parse the data extracted from a fetched data observable
function parse(fetched$){
  const parseBase$ = fetched$
    .filter(data=>(data.response !== undefined && data.progress === undefined))
    //.distinctUntilChanged(d=>d.request.uri,equals)
    .shareReplay(1)

  const parsed$ = parseBase$
    .flatMap(function(data){
      const {uri,id} = data.request//extract uri & id if any
      const {name, ext} = getNameAndExtension(uri)

      //pack up the data, the parser etc nicely
      const data$   = of({uri, id, rawData:data.response, ext, name})
      const parser$ = getParser(ext).pluck('default')// FIXME: for now workaround for es6 modules & babel
      return combineLatestObj({data$, parser$})
    })
    //actual parsing part
    .flatMap(function( {data,parser} ){
      const {rawData, uri, ext, name, id} = data
      const parseOptions = {useWorker:true}

      const parsedObs$ = parser(rawData, parseOptions)
        .doOnError(e=>console.log("error in parse",e))

      const parsedData$  = parsedObs$
        .filter(e=> e.progress === undefined)//seperate out progress data
        .map(postProcessParsedData)
        //.tap(e=>console.log("parsedData",e))

      const progress$ = parsedObs$
        .filter(e=> e.progress !== undefined)//keep ONLY progress data
        .pluck("progress")
        .distinctUntilChanged()
        .startWith(0)

      const meta$ = of({uri, ext, name, id})

      return combineLatestObj({meta$, data:parsedData$, progress$})
    })
    .shareReplay(1)

  return parsed$
}


//helper function to output combine fetch & parse data
function computeCombinedProgress(fetched$, parsed$){
  const fetchToParseRatio = 0.95

  function preProcess(selector,data$){
    return data$
      .map(selector)
      //.distinctUntilChanged()
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


export function resources(sources){
  const fetched$ = fetch(sources)
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
