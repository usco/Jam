import {toArray, generateUUID} from '../../../utils/utils'
import {mergeData} from '../../../utils/modelUtils'

export default function intent(events, params){

  const updateBomEntries$ = events
    .select('bom').events('editEntry$').map(toArray)

  const upsertBomEntries$ = events
    .select('bom').events('addEntry$')
    .map(function(data){//inject extra data
      return mergeData({},data,{id:generateUUID()})
    })
    .map(data=>({id:data.id,data}))//convert data structure to something the BOM model can deal with
    .map(toArray)

  return {
    updateBomEntries$
    ,upsertBomEntries$
  }
}
