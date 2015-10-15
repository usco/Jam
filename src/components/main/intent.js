import {observableDragAndDrop} from '../../interactions/dragAndDrop'

import {entityTypeIntents, entityInstanceIntents} from '../../core/entities/intents2'
import {extractDesignSources,extractMeshSources,extractSourceSources} from '../../core/sources/dataSources'

import {settingsIntent} from    './intents/settings'
import {commentsIntents} from   './intents/comments'
import {selectionsIntents} from './intents/selections'
import {bomIntent} from         './intents/bom'

export default function intent (drivers) {
  const DOM      = drivers.DOM
  const localStorage = drivers.localStorage
  const addressbar   = drivers.addressbar
  const postMessage  = drivers.postMessage
  const events       = drivers.events

  const dragOvers$  = DOM.select("#root").events("dragover")
  const drops$      = DOM.select("#root").events("drop")  
  const dnd$        = observableDragAndDrop(dragOvers$, drops$) 

  //data sources for our main model
  let postMessages$  = postMessage
  const meshSources$ = extractMeshSources({dnd$, postMessages$, addressbar})
  const srcSources$  = extractSourceSources({dnd$, postMessages$, addressbar})

  //settings
  const settingsSources$ = localStorage.get("jam!-settings")
  const settingActions   = settingsIntent(drivers)
  
  //const selectionActions = selectionsIntents({DOM,events}, typesInstancesRegistry$)

  const entityTypeActions = entityTypeIntents({meshSources$,srcSources$})
  

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


  const reset$         = DOM.select('.reset').events("click")
  
  const removeEntityType$ = undefined //same as delete type/ remove bom entry

  const deleteEntityInstance$    = DOM.select('.delete').events("click")
  const duplicateEntityInstance$ = DOM.select('.duplicate').events("click")

  const entityActions = {
     deleteEntityInstance$
    ,duplicateEntityInstance$
    ,reset$
  }


  const bomActions = bomIntent(drivers)

  return {
    dnd$

    ,entityActions
        
    ,settingsSources$
    ,settingActions

    //,selectionActions
    ,entityTypeActions

    ,bomActions

  }
}