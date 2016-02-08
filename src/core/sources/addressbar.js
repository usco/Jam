import {filterByExtensions} from './utils'

export function partMesh(addressbar, params){
  return filterByExtensions( addressbar.get("modelUrl"), params.get('extensions','meshes') )
}

export function partSource(addressbar, params){
  return filterByExtensions( addressbar.get("sourceUrl"), params.get('extensions','sources') )
}