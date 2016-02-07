

function pluginOfSorts_dataProvider(core){
  
  core.register(me)

  //I provide mesh FILES and mesh URIs
  //from drag and drop
  const dndMeshFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data").flatMap(fromArray)
    .filter(exists)
    .filter(file => validateMeshExtension(file.name) )

  const dndMeshUris$   = dnd$.filter(e=> (e.type === "url") ).pluck("data")
    .flatMap(fromArray)
    .filter(exists)
    .filter(url => validateMeshExtension(url) )

  //I provide mesh URIs
  //from adressBar
  const addressbarMeshUris$ = addressbar.get("modelUrl")

  //I provide mesh URIs
  //from postMessage
  const postMessageMeshUris$ = postMessages$.filter(hasModelUrl).pluck("modelUrl") //url sent by postMessage
}



function pluginOfSorts_dataProvider(core){
  
  core.register(me)

  const {dnd$,postMessages$,addressbar} = drivers
  //I provide mesh FILES and mesh URIs
  //from drag and drop
  const dndMeshUris$   = dnd$.filter(e=> (e.type === "url") ).pluck("data")
    .flatMap(fromArray)
    .filter(exists)
    .filter(url => validateMeshExtension(url) )

  //I provide mesh URIs
  //from addressbar
  const addressbarMeshUris$ = addressbar.get("modelUrl")

  //I provide mesh URIs
  //from postMessage
  const postMessageMeshUris$ = postMessages$.filter(hasModelUrl).pluck("modelUrl") //url sent by postMessage

  return merge(
    dndMeshFiles$
    ,addressbarMeshUris$
    ,postMessageMeshUris$
    )
}