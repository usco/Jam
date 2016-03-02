import Rx from 'rx'
const {merge} = Rx.Observable
import {mergeData} from '../../utils/modelUtils'
import {changesFromObservableArrays} from '../../utils/diffPatchUtils'

import bomIntentFromEvents from './actions/fromEvents'


export default function bomIntent(sources, entityTypes$, coreActions, entityActions, actions){

  //BOM
  const addBomEntries$ = changesFromObservableArrays(entityTypes$)
    .pluck('upserted')//"a new type was added"
    //.tap(e=>console.log("type added",e))
    .map(function(typeDatas){
      return typeDatas.map(function({id,name}){
        const data = {id,name, qty:0, phys_qty:0, version:"0.0.1", unit:"QA", printable:true}
        return {id, data}
      })
    })

  const increaseBomEntries$ = coreActions
    .createComponents$
    .map(function(data){
      return data
        .map(function(dat){
          return {offset:1,id:dat.typeUid}
        })
    })
    .merge(
      coreActions.duplicateComponents$
      .map(function(data){
        return data.map(function(dat){
          return {offset:1,id:dat.typeUid}
        })
      })
    )

  const decreaseBomEntries$ = coreActions
    .removeComponents$
    .do(d=>console.log("removing on of",d))
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

  /*      bomIntentFromEvents(sources.events)
    ]
    return mergeActionsByName(settingActionSources)*/

  const updateBomEntries$ = bomIntentFromEvents(sources.events).updateBomEntries$

  let bomActions = mergeData( {addBomEntries$, updateBomEntriesCount$, clearBomEntries$, updateBomEntries$} )

  return bomActions
}
