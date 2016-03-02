import {toArray} from '../../../utils/utils'

export default function intent(events, params){

  const updateBomEntries$ = events
    .select("bom").events("editEntry$").map(toArray)

  return {
    updateBomEntries$
  }
}
