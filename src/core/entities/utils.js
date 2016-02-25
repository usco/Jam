import Rx from 'rx'
const merge = Rx.Observable.merge
import {generateUUID,exists,toArray} from '../../utils/utils'
import {mergeData} from '../../utils/modelUtils'


//function to add extra data to all entity component actions
export function remapEntityActions(entityActions, currentSelections$){

  const duplicateInstances$ = entityActions.duplicateInstances$
    .withLatestFrom(currentSelections$,function(_,selections){
      console.log("selections to duplicate",selections)
      const newId = generateUUID()
      return selections.map(s=>mergeData(s,{newId}) )
    })
    .share()

  const deleteInstances$ = entityActions.deleteInstances$
    .withLatestFrom(currentSelections$,function(_,selections){
      console.log("selections to remove",selections)
      return selections
    })
    .share()

  return mergeData(entityActions,
    {
      duplicateInstances$
      ,deleteInstances$
    })
}

//function to add extra data to meta component actions
export function remapMetaActions(entityActions, componentBase$, currentSelections$, annotationCreations$){
  const createComponentsFromBase$ = componentBase$
    .filter(c=>c.length>0)
    .map(function(datas){
      return datas.map(function({instUid, typeUid, instance}){
        return { id:instUid,  value:{ id:instUid, typeUid, name:instance.name } }
      })
    })
  const createComponentsFromAnnots$ = annotationCreations$
    .filter(c=>c.length>0)
    .map(function(datas){
      return datas.map(function(data){
        console.log("annotation data",data)
        return { id:data.id,  value:data }
      })
    })

  const createComponents$ = merge(
    createComponentsFromBase$
    ,createComponentsFromAnnots$
    ,entityActions.createMetaComponents$//not infered
    ).share()
    //.tap(e=>console.log("creating meta component",e))

  const removeComponents$ = entityActions.deleteInstances$

  const updateComponents$ = entityActions.updateComponent$
     .filter(u=>u.target === "meta")
     .pluck("data")
     .withLatestFrom(currentSelections$.map(s => s.map(s=>s.id)),function(metaChanges, instIds){
        return instIds.map(function(instId){
          return {id:instId, value:metaChanges}
        })
      })

  const duplicateComponents$ = entityActions.duplicateInstances$

  return {
    createComponents$
    ,updateComponents$
    ,duplicateComponents$
    ,removeComponents$
    ,clear$:entityActions.reset$
  }
}

//function to add extra data to mesh component actions
export function remapMeshActions(entityActions, componentBase$, currentSelections$){
  const createComponents$ = componentBase$
    .filter(c=>c.length>0)
    .map(function(datas){
      return datas.map(function({instUid, mesh}){
        return { id:instUid,  value:{ mesh } }
      })
    })
    .merge(entityActions.createMeshComponents$)//not infered
    //.tap(e=>console.log("creating mesh component",e))


  const removeComponents$    = entityActions.deleteInstances$
  const duplicateComponents$ = entityActions.duplicateInstances$

  return {
    createComponents$
    ,duplicateComponents$
    ,removeComponents$
    ,clear$:entityActions.reset$
  }
}

//function to add extra data to transform component actions
export function remapTransformActions(entityActions, componentBase$, currentSelections$){
  const createComponents$ = componentBase$
    .filter(c=>c.length>0)
    .map(function(datas){
      return datas.map(function({instUid, zOffset}){
        return { id:instUid, value:{pos:[0,0,zOffset]} }
      })
    })
    .merge(entityActions.createTransformComponents$)
    //.tap(e=>console.log("creating transforms component",e))


  const removeComponents$ = entityActions.deleteInstances$

  const updateComponents$ = entityActions.updateComponent$
     .filter(u=>u.target === "transforms")
     .pluck("data")
     .withLatestFrom(currentSelections$.map(s => s.map(s=>s.id)),function(transforms, instIds){
        return instIds.map(function(instId){
          return {id:instId, value:transforms}
        })
      })

  const duplicateComponents$ = entityActions.duplicateInstances$

  return {
    createComponents$
    ,updateComponents$
    ,duplicateComponents$
    ,removeComponents$
    ,clear$:entityActions.reset$
  }
}

//function to add extra data to bounds component actions
export function remapBoundsActions(entityActions, componentBase$, currentSelections$){
  const createComponents$ = componentBase$
    .filter(c=>c.length>0)
    .map(function(datas){
      return datas.map(function({instUid, bbox}){
        return { id:instUid, value:bbox }
      })
    })

  const removeComponents$ = entityActions.deleteInstances$

  const duplicateComponents$ = entityActions.duplicateInstances$

  return {
    createComponents$
    ,duplicateComponents$
    ,removeComponents$
    ,clear$: entityActions.reset$
  }
}
