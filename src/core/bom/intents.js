import Rx from 'rx'
const {merge} = Rx.Observable
import {exists} from '../../utils/utils'
import {mergeData} from '../../utils/modelUtils'
import {changesFromObservableArrays} from '../../utils/diffPatchUtils'
import {mergeActionsByName} from '../../utils/obsUtils'

import bomIntentFromEvents from './actions/fromEvents'
import bomIntentFromYm from './actions/fromYm'


export default function bomIntent(sources, entityTypes$, coreActions, entityActions, actions){

  const typeChanges$ = changesFromObservableArrays(entityTypes$).share()

  //BOM
  const upsertBomEntries$ = typeChanges$
    .pluck('upserted')//"a new type was added"
    .filter(e=>e.length>0)
    .tap(e=>console.log("type added",e))
    .map(function(typeDatas){
      return typeDatas.map(function({id,name}){
        //const data = {id, name, qty:0, phys_qty:0, version:"0.0.1", unit:"QA", printable:true}
        const data = {id, name}
        return {id, data}
      })
    })

  const removeBomEntries$  = typeChanges$
    .pluck('removed')
    .filter(e=>e.length>0)
    .tap(e=>console.log("type removed",e))
    .map(function(typeDatas){
      return typeDatas.map(function({id}){
        return {id}
      })
    })

  const increaseBomEntries$ = coreActions
    .createComponents$
      //.filter(exists)
      .map(function(data){
        return data
          .filter(dat=>dat.value.typeUid!==undefined)
          .map(function(dat){
            return {offset:1, id:dat.value.typeUid}
          })
      })
    .merge(
      coreActions.duplicateComponents$
        .tap(e=>console.log("duplicateComponents",e))
        //.filter(exists)
        .map(function(data){
          return data
            .filter(dat=> dat.typeUid!== undefined || dat.value.typeUid!==undefined )
            .map(function(dat){
              return {offset:1, id:dat.typeUid}
          })
        })
    )

  const decreaseBomEntries$ = coreActions
    .removeComponents$
      .map(function(data){
        return data
          .filter(d=>d.id !== undefined)
          .map(function(dat){
            return {offset:-1,id:dat.typeUid}
          })
      })

  const updateBomEntriesCount$ = merge(
    increaseBomEntries$
    , decreaseBomEntries$
  )

  let clearBomEntries$ = merge(
    entityActions.clearDesign$
  )

  const settingActionSources = [
      bomIntentFromEvents(sources.events)
    , bomIntentFromYm(sources.ym)
  ]
  const extraActions =  mergeActionsByName(settingActionSources)

  const upsertBomEntriesAll$ = extraActions.upsertBomEntries$.merge(upsertBomEntries$)
  const updateBomEntries$ = extraActions.updateBomEntries$
  const removeBomEntriesAll$ = extraActions.removeBomEntries$.merge(removeBomEntries$)

  let bomActions = mergeData( {upsertBomEntries$, updateBomEntriesCount$, updateBomEntries$,  upsertBomEntries$:upsertBomEntriesAll$,
    clearBomEntries$, removeBomEntries$:removeBomEntriesAll$} )

  return bomActions
}
