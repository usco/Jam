


export function bomIntents(interactions){
  let contextMenuActions$ = interactions.get(".contextMenu", "actionSelected$").pluck("detail")
  let deleteEntities$     = contextMenuActions$.filter(e=>e.action === "delete").pluck("selections")
  let deleteAllEntities$  = contextMenuActions$.filter(e=>e.action === "deleteAll").pluck("selections")
  let duplicateEntities$  = contextMenuActions$.filter(e=>e.action === "duplicate").pluck("selections")

  deleteEntities$.subscribe(e=>console.log("deleteEntities",e))
  return {
    removeEntries$:deleteEntities$
    //,addEntries$:duplicateEntities$
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
  }

}
