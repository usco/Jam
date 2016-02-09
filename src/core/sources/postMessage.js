import {hasModelUrl, filterByExtensions} from './utils'

export function partMesh(postMessage$, params){
  return filterByExtensions( 
    postMessage$.pluck("data").filter(hasModelUrl).pluck("modelUrl")
      .map(data=>[data])//always return array


    , params.get('extensions','meshes') )//we only let actual mesh "data" through
}

export function partSource(postMessage$, params){
  return filterByExtensions( 
    postMessage$.pluck("data").filter(hasModelUrl).pluck("sourceUrl")
      .map(data=>[data])//always return array

    , params.get('extensions','sources') )//we only let actual sources "data" through
}