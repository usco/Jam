import {filterByExtensions} from './utils'

export function partMesh(addressbar, params){
  return filterByExtensions( addressbar.get("modelUrl"), params.get('extensions','meshes') )
    //.map(data =>  ({src:'http', uri:data})  )
}

export function partSource(addressbar, params){
  return filterByExtensions( addressbar.get("sourceUrl"), params.get('extensions','sources') )
    //.map(data =>  ({src:'http', uri:data})  )
}

export function designSource(addressbar, params){
  return addressbar.get("designUrl").tap(e=>console.log("designUrl",e))
    //.map(data =>  ({src:'http', uri:data})  )
}


