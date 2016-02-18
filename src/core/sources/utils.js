import Rx from 'rx'
const {fromArray, merge} = Rx.Observable
import {getExtension, exists, toArray, isEmpty} from '../../utils/utils'
import {flatten} from 'ramda'


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

/*utility function to dynamically load and use the "data extractors" (ie functions that
   extract useful data from raw data)
  */
export function extractDataFromRawSources(sources, basePath){

  const data = Object.keys(sources).map(function(sourceName){
    try{
      const modulePath     = basePath + "/" + sourceName
      const extractorImport = require(modulePath)
      
      const sourceData     = sources[sourceName]//the raw source of data (ususually a driver)
      const extractorNames = Object.keys(extractorImport) // all the exports from the module
      //console.log("extractorNames",extractorNames)

      //TODO , find a better way to do this
      const paramsHelper = {
        get:function get(category, params){
          const data = {
            'extensions':{
               meshes : ["stl","3mf","amf","obj","ctm","ply"]
              ,sources: ["scad","jscad"]
            }
          }
          return data[category][params]
        }
      }
      
      //deal with all the different data "field" functions that are provided by the imports
      const refinedData =  extractorNames.map(function(name){
        const fn = extractorImport[name]
        if(fn){
          const refinedData = fn(sourceData, paramsHelper)
            .flatMap(fromArray)
            .filter(exists)
            return refinedData
        }
      })

      return refinedData
     
    }catch(error){}
  })
  .filter(data=>data!==undefined)

  return merge( flatten( data ) )
}