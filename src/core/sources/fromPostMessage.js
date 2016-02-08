export function partMesh(postMessage$){
  return postMessage$.pluck("data").filter(hasModelUrl).pluck("modelUrl")
}

export function partSource(postMessage$){
  return postMessage$.pluck("data").filter(hasModelUrl).pluck("sourceUrl")
}