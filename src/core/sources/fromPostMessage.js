function meshUrisAndFilesFromPostMessage(postMessage$){
  return postMessage$.pluck("data").filter(hasModelUrl).pluck("modelUrl")
}

function partSourceFromPostMessage(postMessage$){
  return postMessage$.pluck("data").filter(hasModelUrl).pluck("sourceUrl")
}