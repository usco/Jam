import Rx from 'rx'
const {merge} = Rx.Observable
import {filterByExtensions} from './utils'
import {observableDragAndDrop} from '../../interactions/dragAndDrop'


export function partMesh(DOM, params){

  const dragOvers$  = DOM.select(':root').events("dragover")
  const drops$      = DOM.select(':root').events("drop")  
  const dnd$        = observableDragAndDrop(dragOvers$, drops$) 

  //drag & drop sources
  const dndMeshFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data")  
  const dndMeshUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data")

  return filterByExtensions( merge(dndMeshFiles$, dndMeshUris$), params.get('extensions','meshes') )
    //.map(data =>( {src:'desktop', uri:data.name} ) )
}

export function partSource(DOM, params){
  
  const dragOvers$  = DOM.select(':root').events("dragover")
  const drops$      = DOM.select(':root').events("drop")  
  const dnd$        = observableDragAndDrop(dragOvers$, drops$) 

  //drag & drop sources
  let dndSourceFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data")
  let dndSourceUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data")

  return filterByExtensions( merge(dndSourceFiles$, dndSourceUris$), params.get('extensions','sources') )
    //.map(data => ( {src:'desktop', uri:data.name} ) )
}
