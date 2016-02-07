

function meshUrisAndFilesFromAddressbar(addressbar){
  return addressbar.get("modelUrl")
}

function meshUrisAndFilesFromDnd(dnd$){
 
  //drag & drop sources
  const dndMeshFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data").flatMap(fromArray)
    .filter(exists)    

  const dndMeshUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data")
    .flatMap(fromArray)
    .filter(exists)

  return merge(dndMeshFiles$, dndMeshUris$)
}