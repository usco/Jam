import { toArray } from '../../../utils/utils'

export default function intent (events, params) {
  const updateBomEntries$ = events
    .select('bom').events('editEntry$').map(toArray)

  const upsertBomEntries$ = events
    .select('bom').events('addEntry$')
    /* .map(function(data){//inject extra data
      return mergeData({},data,{id:generateUUID()})
    })*/
    .tap(e => console.log())
    .map(data => ({id: data.id, data})) // convert data structure to something the BOM model can deal with
    .map(toArray)

  /* const removeBomEntries$ = events
    .select('bom').events('removeEntry$')
    .map(toArray) */

  /*
  function hasClear(data){
    if(data && data.hasOwnProperty("clear")) return true
      return false
  }
  const clearBomEntries$ = merge(
      drivers.DOM.select('.clearAll').events('click')
      , drivers.DOM.select('.reset').events('click')//DEBUG ONLY
      , drivers.postMessage
        .filter(hasClear)
    )*/

  return {
    updateBomEntries$,
    upsertBomEntries$
    // ,removeBomEntries$
  }
}
