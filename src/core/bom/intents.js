import Rx from 'rx'

function hasClear(data){
  if(data && data.hasOwnProperty("clear")) return true
    return false
}

export function bomIntents(interactions ){
  let contextMenuActions$ = interactions.get(".contextMenu", "actionSelected$").pluck("detail")
  let deleteEntities$     = contextMenuActions$.filter(e=>e.action === "delete").pluck("selections")
  let deleteAllEntities$  = contextMenuActions$.filter(e=>e.action === "deleteAll").pluck("selections")
  let duplicateEntities$  = contextMenuActions$.filter(e=>e.action === "duplicate").pluck("selections")

  //HACK & duplicate with entity intents
  let postMessages$ = require('../drivers/postMessageDriver')( )
    deleteAllEntities$ = 
      deleteAllEntities$
      .merge(
        postMessages$
        .filter(hasClear)
        .map(true)
      )

  return {
    removeEntries$:deleteEntities$
    //,addEntries$:duplicateEntities$
    ,clearEntries$:deleteAllEntities$
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
