import Rx from 'rx'
import {hasEntity,hasNoEntity,getEntity} from '../../utils/entityUtils'
import {first,toggleCursor} from '../../utils/otherUtils'
import {getXY} from '../../utils/uiUtils'

function dataFromMesh(objTransform$){
  function toArray (vec){
    return vec.toArray().slice(0,3)
  }

  return objTransform$
    .filter(hasEntity)
    .map(
      function(m){ 
        return {
          ids:m.userData.entity.id, 
          pos:toArray(m.position),
          rot:toArray(m.rotation),
          sca:toArray(m.scale)
        } 
    })
    .shareReplay(1)
}

function hasClear(data){
  if(data && data.hasOwnProperty("clear")) return true
    return false
}




export function entityIntents(drivers){
  const DOM    = drivers.DOM
  const events = drivers.events

  ///
  const deleteInstances$          = DOM.select('.delete').events("click")
  const duplicateInstances$       = DOM.select('.duplicate').events("click")

  const removeEntityType$         = undefined //same as delete type/ remove bom entry

  //this resets/clears everything: types and instances etc
  const reset$                    = DOM.select('.reset').events("click")


  const updateCoreComponent$ = events
    .select("entityInfos")
    .events("changeCore$")
    .map(c=>( {target:"core",data:c}))

  const updateTransformComponent$ = events
    .select("entityInfos")
    .events("changeTransforms$")
    .merge(
      events
        .select("gl")
        .events("selectionsTransforms$")
        .debounce(20)
    )
    .map(c=>( {target:"transforms",data:c}))

  const updateComponent$ = merge(
    updateCoreComponent$
    ,updateTransformComponent$
    )

  const entityActions = {
    addInstanceCandidates$
    ,updateComponent$
    ,duplicateInstances$
    ,deleteInstances$
    ,reset$
  }

  return entityActions



  /*let glviewInit$ = interactions.get(".glview","initialized$")
  let shortSingleTaps$ = interactions.get(".glview","shortSingleTaps$")
  let shortDoubleTaps$ = interactions.get(".glview","shortDoubleTaps$")
  let contextTaps$ = interactions.get(".glview","longTaps$").pluck("detail")
    .map(function(e){
      if(!e) return undefined
      return getXY(e)
    }).startWith(undefined)

  let selectionTransforms$ = Rx.Observable.merge(
    //interactions.get(".glview","selectionsTransforms$").pluck("detail").filter(hasEntity)
    //  .map(function(m){ return {ids:m.userData.entity.id, pos:m.position,rot:m.rot,sca:m.sca} })
    dataFromMesh( interactions.get(".glview","selectionsTransforms$").pluck("detail") )
    ,interactions.get(".entityInfos","selectionTransforms$").pluck("detail")
  )

  let contextMenuActions$ = interactions.get(".contextMenu", "actionSelected$").pluck("detail")
  let deleteInstances$     = contextMenuActions$.filter(e=>e.action === "delete").pluck("selections")
    .map(entities=> entities.map( e=>e.id) )
  let deleteAllInstances$  = contextMenuActions$.filter(e=>e.action === "deleteAll").pluck("selections")
  let duplicateInstances$  = contextMenuActions$.filter(e=>e.action === "duplicate").pluck("selections")

  //we need to "shut down the context menu after any click inside of it"
  contextTaps$ = contextTaps$.merge(
    contextMenuActions$.map(undefined)
  )

  deleteAllInstances$ = 
    deleteAllInstances$
    .merge(
      drivers.postMessages
      .filter(hasClear)
      .map(true)
    )

  //stand in for future use (circular depency problem !)
  let replaceAll$ = new Rx.Subject()

  return {
    
    selectionTransforms$

    ,contextTaps$

    ,deleteInstances$
    ,deleteAllInstances$
    ,duplicateInstances$

    ,replaceAll$
    
    addNote$,
    measureDistance$,
    measureThickness$,
    measureAngle$
  }*/
}


export function annotationIntents(interactions){
  let shortSingleTaps$ = interactions.get(".glview","shortSingleTaps$")
  //shortSingleTaps$.pluck("detail").subscribe(e=>console.log("FUUU",e.detail.pickingInfos[0].object.userData))

  let annotationCreationStep$ = shortSingleTaps$
    .pluck("detail")
    .map( (event)=>event.detail.pickingInfos)
    .filter( (pickingInfos)=>pickingInfos.length>0)
    .map(first)
    .share()  

  return {
    creationStep$ : annotationCreationStep$
  }
}