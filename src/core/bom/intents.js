import Rx from 'rx'
const {merge} = Rx.Observable
import { mergeData } from '../../utils/modelUtils'
import { changesFromObservableArrays } from '../../utils/diffPatchUtils'
import { mergeActionsByName } from '../../utils/obsUtils'

import bomIntentFromEvents from './actions/fromEvents'
import bomIntentFromYm from './actions/fromYm'

export default function bomIntent (sources, entityTypes$, metaActions, entityActions) {
  const typeChanges$ = changesFromObservableArrays(entityTypes$).share()

  // BOM
  const upsertBomEntries$ = typeChanges$
    .pluck('upserted') // "a new type was added"
    .filter(e => e.length > 0)
    .tap(e => console.log('type added', e))
    .map(function (typeDatas) {
      return typeDatas
        .filter(x => x.id !== undefined)// we can only deal with data with actual ids
        .map(function ({id, name}) {
          // const data = {id, name, qty:0, phys_qty:0, version:"0.0.1", unit:"QA", printable:true}
          const data = {id, name}
          return {id, data}
        })

    })

  const removeBomEntries$ = typeChanges$
    .pluck('removed')
    .filter(e => e.length > 0)
    .tap(e => console.log('type removed', e))
    .map(function (typeDatas) {
      return typeDatas.map(function ({id}) {
        return {id}
      })
    })

  const increaseBomEntries$ = metaActions
    .createComponents$
    // .filter(exists)
    .tap(e => console.log('increaseBomEntries(from createComponents)', e))
    .map(function (data) {
      return data
        .filter(dat => dat.value.typeUid !== undefined)
        .map(function (dat) {
          return {offset: 1, id: dat.value.typeUid}
        })
    })
    .merge(
      metaActions.duplicateComponents$
        .tap(e => console.log('increaseBomEntries (from duplicateComponents)', e))
        // .filter(exists)
        .map(function (data) {
          return data
            .filter(dat => dat.typeUid !== undefined || dat.value.typeUid !== undefined)
            .map(function (dat) {
              return {offset: 1, id: dat.typeUid}
            })
        })
  )

  const decreaseBomEntries$ = entityActions.deleteInstances$
    .tap(e => console.log('deleteInstances A1', e))
    .map(function (data) {
      return data
        .filter(d => d.id !== undefined || d.typeUid !== undefined)
        .map(function (dat) {
          return {
            offset: -1,
            id: dat.typeUid
          }
        })
    })
    .tap(e => console.log('decreaseBomEntries', e))

  const updateBomEntriesCount$ = merge(
    increaseBomEntries$
    , decreaseBomEntries$
  )

  let clearBomEntries$ = merge(
    entityActions.clearDesign$
  )

  const settingActionSources = [
    bomIntentFromEvents(sources.events),
    bomIntentFromYm(sources.ym)
  ]
  const extraActions = mergeActionsByName(settingActionSources)

  const upsertBomEntriesAll$ = extraActions.upsertBomEntries$.merge(upsertBomEntries$)
  const updateBomEntries$ = extraActions.updateBomEntries$
  const removeBomEntriesAll$ = removeBomEntries$ // extraActions.removeBomEntries$.merge(removeBomEntries$)

  let bomActions = mergeData({
    // upsertBomEntries$,
    upsertBomEntries$: upsertBomEntriesAll$,
    updateBomEntriesCount$,
    updateBomEntries$,
    clearBomEntries$,
    removeBomEntries$: removeBomEntriesAll$
  })

  return bomActions
}
