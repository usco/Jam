import Rx from 'rx'
const {fromArray, merge} = Rx.Observable
import {getExtension, exists, toArray, isEmpty} from '../../utils/utils'

export function hasModelUrl(data){
  if(data && data.hasOwnProperty("modelUrl")) return true
    return false
}

export function hasDesignUrl(data){
  if(data && data.hasOwnProperty("designUrl")) return true
    return false
}

export function validateExtension(extensions,entry){
  return extensions.indexOf(getExtension(entry)) > -1
}

export function filterByExtensions(input, extensions){
  return input
    .flatMap(fromArray)
    .filter(exists)
    .filter(data => validateExtension( extensions, data.name || data ) )

    .map(toArray)
    .filter(data => {
      data = data.filter(exists).filter(data=>!isEmpty(data))
      return  data.length > 0
    })
}

export function normalizeData(input){
  return input
    .map(toArray)
    .filter(data => {
      data = data.filter(exists).filter(data=>!isEmpty(data))
      return  data.length > 0
    })
}

export function filterExtension(input, extensions){
  //extensions should be provided by the parsers that are actually in use see below
  extensions = extensions || {
    meshes :  ["stl","3mf","amf","obj","ctm","ply"]//FIXME: not great, this makes us need an import + fill here to work
    ,sources: ["scad","jscad"]
  }
  //only load meshes for valid extensions
  const allValidExtensions = extensions.meshes.concat(extensions.sources)

  return input
    .flatMap(fromArray)
    .filter(exists)
    .filter(file => validateExtension( allValidExtensions, file.name || file ) )

    .map(toArray)
    .filter(data => {
      data = data.filter(exists).filter(data=>!isEmpty(data))
      return  data.length > 0
    })
}