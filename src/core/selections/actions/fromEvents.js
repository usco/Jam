import Rx from 'rx'
import { toArray, exists } from '../../../utils/utils'
import { hasEntity, getEntity } from '../../../utils/entityUtils'
import { flatten, equals, pluck } from 'ramda'

export default function intent (events, params) {
  const selectEntities$ = events.select('gl').events('selectedMeshes$')
    .map(extractEntities)
    .map(toArray)
    .shareReplay(1)

  const selectBomEntries$ = events.select('bom').events('entryTapped$')
    .map(toArray)
    .shareReplay(1)

  const focusOnEntities$ = events.select('bom').events('entryDoubleTapped$')
    .map(toArray)
    .shareReplay(1)

  return reverseSelections({
    selectEntities$,
    selectBomEntries$,
    focusOnEntities$
  }, params)
}

function extractEntities (data) {
  return data.filter(hasEntity).map(getEntity).map(e => e.id)
}

function reverseSelections (intents, params) {
  const {idsMapper$, removeTypes$, removeInstances$} = params

  // what we want is actually typeUid!
  // select bom entries from entities
  const selectBomEntries$ = intents
    .selectEntities$
    // .do(e=>console.log("reversing instance selections to selectBomEntries"))
    .withLatestFrom(idsMapper$, function (entityIds, idsMapper) {
      return {
        ids: flatten(entityIds.map(id => idsMapper.typeUidFromInstUid[id])).filter(exists),
        idsMapper
      }
    })
    .merge(intents.selectBomEntries$.map(x => ({ ids: pluck('id')(x) })))

  // select entities from bom entries
  const selectEntities$ = intents
    .selectBomEntries$
    // .do(e=>console.log("reversing BOM selections to selectEntities"))
    .withLatestFrom(idsMapper$, function (bomIds, idsMapper) {
      return {
        //if the bom entrys are already selected we want to UNSELECT
        ids: bomIds[0].selected ? [] : flatten(bomIds.map(({id}) => idsMapper.instUidFromTypeUid[id])).filter(exists),
        override: true,
        idsMapper
      }
    })
    // .do(e=>console.log("selectedEntities",e))
    //.merge(intents.selectEntities$.map(x => ({ ids: x })))
    .merge( intents.selectEntities$.withLatestFrom(idsMapper$,function(ids, idsMapper){
      return {
        ids,
        idsMapper
      }
    }))


  ///////////
  const selectBomEntries2$ = intents.selectBomEntries$.withLatestFrom(idsMapper$, function (ids, idsMapper) {
      return {
        ids: pluck('id')(ids),
        idsMapper,
        type: 'types'
      }
    })

  const selectEntities2$ = intents.selectEntities$.withLatestFrom(idsMapper$, function (ids, idsMapper) {
      return {
        ids,
        idsMapper,
        type: 'instances'
      }
    })

  const selectInstancesAndTypes$ = selectEntities2$.merge(selectBomEntries2$)


  const focusOnEntities$ = intents
    .focusOnEntities$
    .withLatestFrom(idsMapper$, function (bomIds, idsMapper) {
      return flatten(bomIds.map(id => idsMapper.instUidFromTypeUid[id])).filter(exists)
    })
    .distinctUntilChanged(null, equals)

  return {
    focusOnEntities$,
    selectInstancesAndTypes$,
    removeInstances$:removeInstances$.tap(e=>console.log('mlkmkll',e)),
    removeTypes$
  }
}
