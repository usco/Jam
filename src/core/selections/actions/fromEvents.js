import { toArray, exists } from '../../../utils/utils'
import { hasEntity, getEntity } from '../../../utils/entityUtils'
import { flatten, equals } from 'ramda'

export default function intent (events, params) {
  const {idsMapper$} = params

  const selectEntities$ = events.select('gl').events('selectedMeshes$')
    .map(extractEntities)
    .map(toArray)
    .shareReplay(1)

  const selectBomEntries$ = events.select('bom').events('entryTapped$')
    .map(toArray)
    .shareReplay(1)

  return reverseSelections({
    selectEntities$,
    selectBomEntries$}, idsMapper$)
}

function extractEntities (data) {
  return data.filter(hasEntity).map(getEntity).map(e => e.id)
}

function reverseSelections (intents, idsMapper$) {
  // what we want is actually typeUid!
  // select bom entries from entities
  const selectBomEntries$ = intents
    .selectEntities$
    // .do(e=>console.log("reversing instance selections to selectBomEntries"))
    .withLatestFrom(idsMapper$, function (entityIds, idsMapper) {
      return flatten(entityIds.map(id => idsMapper.typeUidFromInstUid[id])).filter(exists)
    })
    // .do(e=>console.log("selectedBomEntries",e))
    .merge(intents.selectBomEntries$)

  // select entities from bom entries
  const selectEntities$ = intents
    .selectBomEntries$
    // .do(e=>console.log("reversing BOM selections to selectEntities"))
    .withLatestFrom(idsMapper$, function (bomIds, idsMapper) {
      return flatten(bomIds.map(id => idsMapper.instUidFromTypeUid[id])).filter(exists)
    })
    // .do(e=>console.log("selectedEntities",e))
    .merge(intents.selectEntities$)

  return {
    selectEntities$: selectEntities$.distinctUntilChanged(null, equals),
    selectBomEntries$: selectBomEntries$.distinctUntilChanged(null, equals)
  }
}
