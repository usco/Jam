import Rx from 'rx'
const merge = Rx.Observable.merge
import {exists,getExtension,getNameAndExtension, isValidFile, isValidUrl, isEmpty} from './utils'
import assign from 'fast.js/object/assign'//faster object.assign


function isValidDataSource(data){
  const valid =  isValidFile(data) || isValidUrl(data)
  return valid
}

function dataSource(data){
  if(isValidFile(data)){
    return {
      src:'desktop'
      ,uri: data.name
    }
  }
  else if(isValidUrl(data)){
    return {
      src:'http'
      ,uri:data
    }
  }
}

export default function assetRequests(inputs, sources){
  //FIXME: caching should be done at a higher level , to prevent useless requests
  const resourceCache$ = undefined
  const cache = {}
  function getCached(inputs){
    //this one needs to be store independant too
  }

  const baseRequest$ = inputs
    .flatMap(Rx.Observable.fromArray)
    .filter(exists)
    .filter(data=>!isEmpty(data))
    .filter(isValidDataSource)
    .map(function(data){
      const source     = dataSource(data)
      const uri        = source.uri
      const {name,ext} = getNameAndExtension(uri)
      return {src:source.src, uri, data, ext, name}
    })

  const requests$ = baseRequest$
    .filter(function(req){
      const cached = cache[req.uri]
      return cached === undefined
    })

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

  return requests

}
