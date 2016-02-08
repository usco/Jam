import {hasModelUrl} from './utils'

export function partMesh(postMessage$){
  return postMessage$.pluck("data").filter(hasModelUrl).pluck("modelUrl")
    .map(data=>[data])//always return array
}

export function partSource(postMessage$){
  return postMessage$.pluck("data").filter(hasModelUrl).pluck("sourceUrl")
    .map(data=>[data])//always return array
}