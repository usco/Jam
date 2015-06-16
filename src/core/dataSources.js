import {observableDragAndDrop} from '../interactions/interactions'
import Rx from 'rx'
let Observable= Rx.Observable
let merge = Rx.Observable.merge

/////////////
//deal with data sources
let meshExtensions = ["stl","amf","obj","ctm","ply"]

//only load meshes for resources that are ...mesh files
function validMeshExtension(entry){
  return meshExtensions.indexOf(getExtension(entry.name)) > -1
}


export function getDataSources ( container ){
  //drag & drop sources
  let dnds$ = observableDragAndDrop(container)
  //other sources (url, localstorage)
  let urlSources = require('./urlSources')

  let dndMeshUris$  = dnds$.filter(e=>e.type ==="file").pluck("data").flatMap(Observable.fromArray)

  //meshSources is either url or file (direct data)
  let meshSources$ = merge(
    urlSources.meshUris$,
    dndMeshUris$
  )

  //FIXME these are technically untrue, but still should work
  let dndDesignUris$ = dnds$.filter(e=>e.type === "url").pluck("data").flatMap(Observable.fromArray)

  let designSources$ = merge(
    urlSources.designUri$,
    dndDesignUris$
  )

  return {meshSources$, designSources$}
}


 