import Rx from 'rx'
const {merge} = Rx.Observable

export function partMesh(dnd$){
  //drag & drop sources
  const dndMeshFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data")  
  const dndMeshUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data")

  return merge(dndMeshFiles$, dndMeshUris$)
}

export function partSource(dnd$){
  //drag & drop sources
  let dndSourceFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data")
  let dndSourceUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data")

  return merge(dndSourceFiles$, dndSourceUris$)
}
