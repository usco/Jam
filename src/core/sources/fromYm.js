import {nameCleanup} from '../../utils/formatters'
import {head} from 'ramda'



export function makeEntityActions(certains$){



  const createMetaComponents$      = certains$.map(data=>data.data.instMeta)
    //NOTE :we are doing these to make them compatible with remapMetaActions helpers, not sure this is the best
    .map(function(datas){
      return datas.map(function({instUid, typeUid, name}){
        return { id:instUid,  value:{ id:instUid, typeUid, name } }
      })
    })
  const createTransformComponents$ = certains$.pluck('mesh')
    .map(function(datas){
      return datas.map(function({instUid, transforms}){
        return { id:instUid, value:{pos:[transforms[11],transforms[10],transforms[9]]} }
      })
    })
  const createMeshComponents$      = certains$.map(function(data){
    return data.data.instMeta.map(function(instMeta){
        let meshData = head( data.data.typesMeshes.filter(mesh=>mesh.typeUid === instMeta.typeUid) )
        return {
          id:instMeta.instUid
          ,value:{mesh:meshData.mesh.clone()}
        }
      })
  })

   //TODO : this would need to be filtered based on pre-existing type data
  const addEntityTypes$ = certains$
    .map(function(data){
      return data.data.typesMeta.map(function(typeMeta,index){
        if(typeMeta.name === undefined){//we want type names in any case, so we infer this base on "file" name
          typeMeta.name = nameCleanup( data.meta.name )
          if(index>0){
            typeMeta.name = typeMeta.name+index
          }
        }
        return typeMeta
      })
    })

  return {
      addEntityTypes$
    , createMetaComponents$
    , createTransformComponents$
    , createMeshComponents$
  }
}