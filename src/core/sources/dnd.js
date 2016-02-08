import Rx from 'rx'
const {merge} = Rx.Observable
import {filterByExtensions} from './utils'


export function partMesh(dnd$, params){
  //drag & drop sources
  const dndMeshFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data")  
  const dndMeshUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data")

  return filterByExtensions( merge(dndMeshFiles$, dndMeshUris$), params.get('extensions','meshes') )
}

export function partSource(dnd$, params){
  //drag & drop sources
  let dndSourceFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data")
  let dndSourceUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data")

  return filterByExtensions( merge(dndSourceFiles$, dndSourceUris$), params.get('extensions','sources') )
}
