import Rx from 'rx'
const {fromArray} = Rx.Observable
import {head, pick, equals} from 'ramda'
import {nameCleanup} from '../../../utils/formatters'
import {remapJson, toArray, exists} from '../../../utils/utils'
import {mergeData} from '../../../utils/modelUtils'


function rawData(ym){

  const parts = ym
    .filter(res=>res.request.method==='get' && res.request.type === 'ymLoad' && res.request.typeDetail=== 'parts')
    .mergeAll()
    .pluck('response')
    //.tap(e=>console.log("in parts: ",e))

  const assemblies = ym
    .filter(res=>res.request.method==='get' && res.request.type === 'ymLoad' && res.request.typeDetail=== 'assemblyEntries')
    .mergeAll()
    .pluck('response')
    //.tap(e=>console.log("in assemblies: ",e))

    return {
      parts
      ,assemblies
    }
  }

export default function intent({ym, resources}, params){
  const data = rawData(ym)

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
    //.tap(e=>console.log("meta",e))

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
        data.sca = data.sca.map(parseFloat)
        //NOTE :we are doing these to make them compatible with remapMetaActions helpers, not sure this is the best
        return { id:data.id,  value:data }
      })
    })
    //.tap(e=>console.log("transforms",e))
    /*ext: "stl"
flags: "noInfer"
id: "1535f856dd0iT"
name: "UM2CableChain_BedEnd.STL"
uri: "*/


  //this makes sure that meshes ALWAYS get resolved, regardless of the order
  //that mesh information and metadata gets recieved
  function combineAndWaitUntil(meshesData$, assemblyData$){
    const obs = new Rx.ReplaySubject()

    let metas = []
    let meshes = {}

    function matchAttempt(id){
      metas.forEach(function(data){
        const mesh = meshes[data.typeUid]
        if( mesh !== undefined ){
          //mesh = mesh.clone()//meh ?
          //mesh.material = mesh.material.clone()
          //mesh.userData = {}
          const result = mergeData(data, {value:{mesh}})
          obs.onNext(result)//ONLY emit data when we have a match
        }
      })
    }

    meshesData$
      .forEach(function(meshData){
        let mesh = meshData.data.typesMeshes[0].mesh
        meshes[ meshData.meta.id ] = mesh
        matchAttempt(meshData.meta.id)
      })

    assemblyData$
      .flatMap(fromArray)
      .forEach(function(data){
        metas.push(data)
        matchAttempt(data.typeUid)
      })

    return obs
  }

  const meshComponentMeshes$ = resources.filter(data=>data.meta.id !== undefined)

  const meshComponentAssemblyData$      = assemblyData$
    .map(function(datas){
      return datas.map(function(entry){
        const mapping = {
          'uuid':'id'
          ,'part_uuid':'typeUid'
        }
        const fieldNames = ['id','typeUid']
        let data = pick( fieldNames, remapJson(mapping, entry) )
        return { id:data.id, typeUid:data.typeUid, value:undefined }
      })
    })


    const createMeshComponents$ = combineAndWaitUntil(meshComponentMeshes$, meshComponentAssemblyData$)
      .map(toArray)

  /*const createMeshComponents$ = meshComponentMeshes$
    .combineLatest(meshComponentAssemblyData$,function(meshData, datas){

      return datas.map(function(data){
        let mesh = meshData.data.typesMeshes[0].mesh.clone()//meh ?
        mesh.material = mesh.material.clone()
        mesh.userData = {}

        const validCombo = (data.typeUid === meshData.meta.id)
        const result = validCombo? mergeData(data, {value:{mesh}}): undefined
        //console.log("createMeshComponents",result)
        return result
      }).filter(exists)

    })
    .map(toArray)*/

    //.tap(e=>console.log("meshComponent",e))

  /*const createMeshComponents$      = assemblyData$
    .map(function(datas){
      console.log("meshDatas",datas)
      return datas.map(function(entry){
        const mapping = {
          'uuid':'id'
          ,'part_uuid':'typeUid'
        }
        const fieldNames = ['id','typeUid']
        let data = pick( fieldNames, remapJson(mapping, entry) )
        return { id:data.id, typeUid:data.typeUid, value:undefined }
      })
    })
    .flatMap(fromArray)
    .combineLatest(meshComponentMeshes$,function(data, meshData){
      //console.log("data", data, "meshData",meshData)
      let mesh = meshData.data.typesMeshes[0].mesh.clone()//meh ?
      mesh.material = mesh.material.clone()
      mesh.userData = {}

      const validCombo = (data.typeUid === meshData.meta.id)
      const result = validCombo? mergeData(data, {value:{mesh}}): undefined

      console.log("createMeshComponents",result)
      return result
    })
    .filter(exists)
    .map(toArray)*/
    //.tap(e=>console.log("meshComponent",e))

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


  //send out requests to fetch data for meshes
  const meshRequests$ = partsData$
    .map(function(data){
      return data.map(function(entry) {
        const mapping = {
          'uuid':'id'
        }
        const fieldNames = ['id','name','description','binary_document_id','binary_document_url','source_document_id','source_document_url']
        const data = pick( fieldNames, remapJson(mapping, entry) )

        return {src:'http', method:'get', uri: data.binary_document_url, url:data.binary_document_url, id:data.id, type:'resource', flags:'noInfer'}
      })
    })
    .flatMap(fromArray)
    .filter(req=>req.uri !== undefined && req.uri !== '')
    .tap(e=>console.log("meshRequests",e))


  return {
      addTypes$
    , createMetaComponents$
    , createTransformComponents$
    , createMeshComponents$

    , requests$:meshRequests$
  }
}
