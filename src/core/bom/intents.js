import Rx from 'rx'

function hasClear(data){
  if(data && data.hasOwnProperty("clear")) return true
    return false
}

export function bomIntents(interactions ){
  let contextMenuActions$ = interactions.get(".contextMenu", "actionSelected$").pluck("detail")
  let deleteInstances$     = contextMenuActions$.filter(e=>e.action === "delete").pluck("selections")
  let deleteAllInstances$  = contextMenuActions$.filter(e=>e.action === "deleteAll").pluck("selections")
  let duplicateInstances$  = contextMenuActions$.filter(e=>e.action === "duplicate").pluck("selections")

  //HACK & duplicate with entity intents
  let postMessages$ = require('../drivers/postMessageDriver')( )
    deleteAllInstances$ = 
      deleteAllInstances$
      .merge(
        postMessages$
        .filter(hasClear)
        .map(true)
      )

  return {
    removeEntries$:deleteInstances$
    //,addEntries$:duplicateInstances$
    ,clearEntries$:deleteAllInstances$
  } 
}



export function entriesFromEntities(intents, entities$){

  let removeEntries$ = intents
    .removeEntries$
    .withLatestFrom(entities$,function(entityIds,entities){
      console.log("get entries from entities",entityIds,entities)
      return entityIds.map(id=>entities.byId[id].typeUid)
    })


  return {
    removeEntries$
    ,clearEntries$:intents.clearEntries$
    ,addBomEntries$:new Rx.Subject()
  }

}
