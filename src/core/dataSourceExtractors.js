import {Rx} from '@cycle/core'
let merge = Rx.Observable.merge
let fromArray = Rx.Observable.fromArray

import {getExtension,exists,toArray} from '../utils/utils'


function hasModelUrl(data){
  if(data && data.hasOwnProperty("modelUrl")) return true
    return false
}
function hasDesignUrl(data){
  if(data && data.hasOwnProperty("designUrl")) return true
    return false
}

function validateExtension(extensions,entry){
  return extensions.indexOf(getExtension(entry)) > -1
}

/*
extract design source streams 
@param rawSources$: hash of observables/drivers
*/
export function extractDesignSources ( rawSources ){
  
  const {dnd$, addressbar} = rawSources

  //FIXME these are technically untrue, but still should work
  let dndDesignUris$ = dnd$
    .filter(e=> (e.type === "url" || e.type==="text") )
    .pluck("data")
    .flatMap(Observable.fromArray)

  let designSources$ = merge(
    addressbar.get("designUrl")
    ,dndDesignUris$
  )

  return designSources$
}

/*
extract mesh source streams 
@param rawSources: hash of observables/drivers
@param extensions: hash of mesh extensions 
*/
export function extractMeshSources( rawSources, extensions ){
  extensions = extensions || {
    meshes : ["stl","amf","obj","ctm","ply"]
  }
  const {dnd$, postMessages$, addressbar} = rawSources

  //only load meshes for resources that are ...mesh files
  const validateMeshExtension = validateExtension.bind(null,extensions.meshes)

  //drag & drop sources
  let dndMeshFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data").flatMap(fromArray)
    .filter(file => validateMeshExtension(file.name) )

  let dndMeshUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data").flatMap(fromArray)
    .filter(url => validateMeshExtension(url) )

  let addressbarMeshUris$ = addressbar.get("modelUrl")

  //sources of meshes
  //meshSources are either urls or files (direct data, passed by drag & drop etc)
  const meshSources$ = merge(
    dndMeshFiles$
    ,dndMeshUris$
    ,postMessages$.filter(hasModelUrl).pluck("modelUrl") //url sent by postMessage
    ,addressbarMeshUris$
  )
    .map(toArray)

  return meshSources$
}

/*
extract source source streams (openscad, openjscad , freecad, etc)
@param rawSources: hash of observables/drivers
@param extensions: hash of mesh extensions 
*/
export function extractSourceSources( rawSources, extensions){

  extensions = extensions || {
    meshes : ["scad","jscad","coffee"]
  }
  const {dnd$, postMessages$, addressbar} = rawSources


  //only load meshes for resources that are ...mesh files
  const validateSourceExtension = validateExtension.bind(null,extensions.meshes)

  //drag & drop sources
  let dndSourceFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data").flatMap(fromArray)
    .filter(file => validateSourceExtension(file.name) )

  let dndSourceUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data").flatMap(fromArray)
    .filter(url => validateSourceExtension(url) )

  let addressbarSourceUris$ = addressbar.get("sourceUrl")

  //sources of meshes
  //meshSources are either urls or files (direct data, passed by drag & drop etc)
  const soureSources$ = merge(
    dndSourceFiles$
    ,dndSourceUris$
    ,postMessages$.filter(hasModelUrl).pluck("sourceUrl") //url sent by postMessage
    ,addressbarSourceUris$
  )

  return soureSources$
}