import Rx from 'rx'
const merge = Rx.Observable.merge
import {exists,getExtension,getNameAndExtension, isValidFile, isEmpty} from './utils'
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

export default function assetRequests(inputs, drivers){
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
