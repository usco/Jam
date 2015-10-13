import {observableDragAndDrop} from '../../interactions/dragAndDrop'

import {entityTypeIntents, entityInstanceIntents} from '../../core/entities/intents2'


export default function intent (drivers) {
  const DOM      = drivers.DOM
  const localStorage = drivers.localStorage
  const addressbar   = drivers.addressbar
  const postMessage  = drivers.postMessage
  const events       = drivers.events

  const dragOvers$  = DOM.select("#root").events("dragover")
  const drops$      = DOM.select("#root").events("drop")  
  const dnd$        = observableDragAndDrop(dragOvers$, drops$) 


  //const  createEntityType$ = entityTypeIntents({meshSources$,srcSources$})

  /*let createEntityBase$  =  entityInstanceIntents(entityTypes$)
    .addInstances$
    .map(function(newTypes){
      return newTypes.map(function(typeData){
        let instUid = Math.round( Math.random()*100 )
        let typeUid = typeData.id
        let instName = typeData.name+"_"+instUid

        let instanceData = {
          id:instUid
          ,typeUid
          ,name:instName
        }
        return instanceData
      })
      console.log("DONE with entityInstancesBase")
    })
    .shareReplay(1)*/


  ///entity actions
  events.select("entityInfos")
    .flatMap(e=>e.changeTransforms$)
    /*.withLatestFrom(selections$.pluck("instIds"),function(transforms, instIds){
      console.log("setting transforms", transforms, instIds)
      /*instIds.map(function(instId){
        transformActions.updateTransforms$.onNext({id:instId, value:transforms})
      })
    })*/
    .subscribe(e=>console.log("sdfdsf",e))

  return {
    dnd$

    //,createEntityBase$
  }
}