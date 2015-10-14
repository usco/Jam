import Rx from 'rx'
let merge = Rx.Observable.merge


function hasClear(data){
  if(data && data.hasOwnProperty("clear")) return true
    return false
}

export function bomIntent(drivers){
  /*let contextMenuActions$ = interactions.get(".contextMenu", "actionSelected$").pluck("detail")
  let deleteInstances$     = contextMenuActions$.filter(e=>e.action === "delete").pluck("selections")
  let duplicateInstances$  = contextMenuActions$.filter(e=>e.action === "duplicate").pluck("selections")*/

  const clearBomEntries$ = merge(
    drivers.DOM.select('.clearAll').events('click')
    , drivers.postMessage
      .filter(hasClear)
  )
    .map(true)
    .shareReplay(1)

  return {
    //removeEntries$:deleteInstances$
    //addBomEntries$
    clearBomEntries$
  } 
}



/*export function entriesFromEntities(intents, entities$){

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

}*/
