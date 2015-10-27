import {Rx} from '@cycle/core'
const merge = Rx.Observable.merge
import {generateUUID,exists,toArray} from '../../utils/utils'

//function to add extra data to entityActions
export function remapEntityActions(entityActions, currentSelections$){

  const duplicateEntityInstances$ = entityActions.duplicateEntityInstances$
    .withLatestFrom(currentSelections$,function(_,selections){
      console.log("selections to duplicate",selections)
      const newId = generateUUID()
      return selections.map(s=>Object.assign({},s,{newId}) )
    })
    .share()

  const deleteEntityInstances$ = entityActions.deleteEntityInstances$
    .withLatestFrom(currentSelections$,function(_,selections){
      console.log("selections to remove",selections)
      return selections
    })
    .share()

  return Object.assign({},entityActions, 
    {
      duplicateEntityInstances$
      ,deleteEntityInstances$
    })
}


export function remapCoreActions(entityActions, componentBase$, currentSelections$, annotationCreations$){
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
    ).share()

  const removeComponents$ = entityActions.deleteEntityInstances$
  
  const updateComponents$ = entityActions.updateComponent$
     .filter(u=>u.target === "core")
     .pluck("data")
     .withLatestFrom(currentSelections$.map(s => s.map(s=>s.id)),function(coreChanges, instIds){
        return instIds.map(function(instId){
          return {id:instId, value:coreChanges}
        })
      })

  const duplicateComponents$ = entityActions.duplicateEntityInstances$

  return {
    createComponents$
    ,removeComponents$
    ,clear:entityActions.reset$
    ,updateComponents$
    ,duplicateComponents$
  }
}

export function remapMeshActions(entityActions, componentBase$, currentSelections$){
  const createComponents$ = componentBase$
    .filter(c=>c.length>0)
    .map(function(datas){
      return datas.map(function({instUid, mesh}){
        return { id:instUid,  value:{ mesh } }
      })
    })

  const removeComponents$ = entityActions.deleteEntityInstances$

  const duplicateComponents$ = entityActions.duplicateEntityInstances$

  return {
    createComponents$
    ,duplicateComponents$
    ,removeComponents$
    ,clear:entityActions.reset$
  }
}

export function remapTransformActions(entityActions, componentBase$, currentSelections$){
  const createComponents$ = componentBase$
    .filter(c=>c.length>0)
    .map(function(datas){
      return datas.map(function({instUid, zOffset}){
        return { id:instUid, value:{pos:[0,0,zOffset]} }
      })
    })

  const removeComponents$ = entityActions.deleteEntityInstances$

  const updateComponents$ = entityActions.updateComponent$
     .filter(u=>u.target === "transforms")
     .pluck("data")
     .withLatestFrom(currentSelections$.map(s => s.map(s=>s.id)),function(transforms, instIds){
        console.log("instIds",instIds)
        return instIds.map(function(instId){
          return {id:instId, value:transforms}
        })
      })

  const duplicateComponents$ = entityActions.duplicateEntityInstances$

  return {
    createComponents$
    ,removeComponents$
    ,clear:entityActions.reset$
    ,updateComponents$
    ,duplicateComponents$
  }
}


export function remapBoundsActions(entityActions, componentBase$, currentSelections$){
  const createComponents$ = componentBase$
    .filter(c=>c.length>0)
    .map(function(datas){
      return datas.map(function({instUid, bbox}){
        return { id:instUid, value:bbox }
      })
    })

  const removeComponents$ = entityActions.deleteEntityInstances$

  const duplicateComponents$ = entityActions.duplicateEntityInstances$
  
  return {
    createComponents$
    ,duplicateComponents$
    ,removeComponents$
    ,clear: entityActions.reset$
  }
}