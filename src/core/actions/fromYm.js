import Rx from 'rx'
const {fromArray} = Rx.Observable
import {head, pick, equals} from 'ramda'
import {nameCleanup} from '../../utils/formatters'


function remapJson(mapping, input){

  const result =  Object.keys(input)
    .reduce(function(obj, key){
      if(key in mapping){
        obj[mapping[key]] = input[key]
      }
      else{
        obj[key] = input[key]
      }
      return obj
    },{})
  //console.log("remapJson",result)
  return result
}

function rawData(ym){

  const bom = ym
    .filter(res=>res.request.method==='get' && res.request.type === 'ymLoad' && res.request.typeDetail=== 'bom')
    .mergeAll()
    .pluck('response')
    .tap(e=>console.log("in bom: ",e))

  const parts = ym
    .filter(res=>res.request.method==='get' && res.request.type === 'ymLoad' && res.request.typeDetail=== 'parts')
    .mergeAll()
    .pluck('response')
    .tap(e=>console.log("in parts: ",e))

  const assemblies = ym
    .filter(res=>res.request.method==='get' && res.request.type === 'ymLoad' && res.request.typeDetail=== 'assemblies')
    .mergeAll()
    .pluck('response')
    .tap(e=>console.log("in assemblies: ",e))

    return {
      bom
      ,parts
      ,assemblies
    }
  }


export function makeEntityActionsFromYm(ym){
  const data = rawData(ym)

  const createMeshComponents$      = Rx.Observable.never()

  data.parts.forEach(e=>console.log("foo",e))

  const partsData$ = data.parts
    .share()

  const assemblyData$ = data.assemblies
    .share()

  const createMetaComponents$ = assemblyData$
    .map(function(datas){
      return datas.map(function(entry){
        const mapping = {
          'uuid':'id'
          ,'part_uuid':'typeUid'
        }
        //NOTE :we are doing these to make them compatible with remapMetaActions helpers, not sure this is the best
        const fieldNames = ['name','color','id','typeUid']
        const data = pick( fieldNames, remapJson(mapping, entry) )
        return { id:data.id,  value:data }
      })
    })
    .tap(e=>console.log("meta",e))

  const createTransformComponents$ = assemblyData$
    .map(function(datas){
      return datas.map(function(entry){
        const mapping = {
          'uuid':'id'
          ,'part_uuid':'typeUid'
        }
        const fieldNames = ['name','id','typeUid','pos','rot','sca']
        let data = pick( fieldNames, remapJson(mapping, entry) )

        data.pos = data.pos.map(parseFloat)
        data.rot = data.rot.map(parseFloat)
        data.sca = data.rot.map(parseFloat)
        //NOTE :we are doing these to make them compatible with remapMetaActions helpers, not sure this is the best
        return { id:data.id,  value:data }
      })
    })
    .tap(e=>console.log("transforms",e))

  /*const createMeshComponents$      = assemblyData$
    .map(function(data){
    return data.data.instMeta.map(function(instMeta){
        let meshData = head( data.data.typesMeshes.filter(mesh=>mesh.typeUid === instMeta.typeUid) )
        return {
          id:instMeta.instUid
          ,value:{mesh:meshData.mesh.clone()}
        }
      })
  })*/

   //TODO : this would need to be filtered based on pre-existing type data ?
  const addTypes$ = partsData$
    .map(function(data){
      return data.map(function(entry) {
        const mapping = {
          'uuid':'id'
        }
        const fieldNames = ['id','name','description','binary_document_id','binary_document_url','source_document_id','source_document_url']
        const data = pick( fieldNames, remapJson(mapping, entry) )
        return {id:data.id, data:undefined, meta:data}
      })
    })
    .flatMap(fromArray)
    //.forEach(e=>console.log("addEntityTypes",e))


  const meshRequests$ = partsData$
    .map(function(data){
      return data.map(function(entry) {
        const mapping = {
          'uuid':'id'
        }
        const fieldNames = ['id','name','description','binary_document_id','binary_document_url','source_document_id','source_document_url']
        const data = pick( fieldNames, remapJson(mapping, entry) )

        return {src:'http', uri: data.binary_document_url, id:data.id}
      })
    })
    .forEach(e=>console.log("meshRequests",e))

  return {
      addTypes$
    , createMetaComponents$
    , createTransformComponents$
    //, createMeshComponents$
  }
}
