import {generateUUID} from './utils'
import {postProcessMesh,geometryFromBuffers} from './meshUtils'
import {meshTools} from 'glView-helpers'
const {centerMesh} = meshTools

export function postProcessParsedData(data){
  //TODO: unify parsers' returned data/api ?
  //console.log("postProcessMesh/data",data)
  let mesh = undefined
  if("objects" in data){
    //for 3mf , etc
    //console.log("data",data)
    let typesMetaHash = {}
    let typesMeshes   = []
    let typesMeta = []

    //we need to make ids unique
    let idLookup = {}

    for(let objectId in data.objects){
      //console.log("objectId",objectId, data.objects[objectId])
      let item  = data.objects[objectId]

      const typeUid = generateUUID()
      idLookup[item.id] = typeUid

      let meta = {id:typeUid, name:item.name}
      typesMeta.push(meta)
      typesMetaHash[typeUid] = meta

      mesh = geometryFromBuffers(item)
      mesh = postProcessMesh(mesh)
      mesh = centerMesh(mesh)
      typesMeshes.push({typeUid, mesh})
    }

    //now for the instances data
    let instMeta = []
    let instTransforms = []
    data.build.map(function(item){

      const instUid = generateUUID()
      let id =idLookup[item.objectid]

      instMeta.push( { instUid, typeUid: id} )//TODO : auto generate name
      if('transforms' in item ){
        instTransforms.push({instUid, transforms:item.transforms})
      }else{
        instTransforms.push({instUid, transforms:[0,0,0,0,0,0,0,0,0,0,0,0]})
      }
    })
    //console.log("typesMeta",typesMeta,"typesMeshes",typesMeshes,"instMeta",instMeta,"instTransforms",instTransforms)

    return {meshOnly:false, typesMeshes, typesMeta, instMeta ,instTransforms}

  }else{
    mesh = data
    mesh = geometryFromBuffers(mesh)
    mesh = postProcessMesh(mesh)
    mesh = centerMesh(mesh)

    let typesMeshes   = [{typeUid:undefined, mesh}]

    return {meshOnly:true, typesMeshes}
  }

  return mesh
}
