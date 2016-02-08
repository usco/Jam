export function partMesh(dnd$){
  //drag & drop sources
  const dndMeshFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data").flatMap(fromArray)
    .filter(exists)    

  const dndMeshUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data")
    .flatMap(fromArray)
    .filter(exists)

  return merge(dndMeshFiles$, dndMeshUris$)
}

export function partSource(dnd$){
  //drag & drop sources
  let dndSourceFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data").flatMap(fromArray)

  let dndSourceUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data").flatMap(fromArray)

  return merge(dndSourceFiles$, dndSourceUris$)
}
