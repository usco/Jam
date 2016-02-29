import Rx from 'rx'
const {merge} = Rx.Observable
import {mergeData} from '../../../utils/modelUtils'
import {changesFromObservableArrays} from '../../../utils/diffPatchUtils'

export function entityInstanceIntents(entityTypes$){
  entityTypes$
    .forEach(e=>console.log("entityTypes",e))

  const addInstances$ = changesFromObservableArrays(entityTypes$)
    .pluck('upserted')

  return {
    addInstances$
  }
}


export default function bomIntent(sources, entityTypes$, coreActions, entityActions, actions){

  //BOM
  const addBomEntries$ = entityInstanceIntents(entityTypes$)
    .addInstances$//in truth this just mean "a new type was added"
    .map(function(typeDatas){
      return typeDatas.map(function({id,name}){
        return {id,name,qty:0,version:"0.0.1",unit:"QA",printable:true}
      })
    })

  const increaseBomEntries$ = coreActions
    .createComponents$
    .map(function(data){
      return data
        .map(v=>v.value.typeUid)
        .map(function(id){
          return {offset:1,id}
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
    .do(d=>console.log("removing",d))
    .map(function(data){
      return data
        .filter(d=>d.id !== undefined)
        .map(d=>d.typeUid)
        .map(function(id){
          return {offset:-1,id}
        })
    })

  const updateBomEntriesCount$ = merge(
    increaseBomEntries$
    , decreaseBomEntries$
  )

  let clearBomEntries$ = merge(
    entityActions.reset$
  )

  const updateBomEntries$ = actions.bomActions.updateBomEntries$

  let bomActions = mergeData( {addBomEntries$, updateBomEntriesCount$, clearBomEntries$, updateBomEntries$} )

  return bomActions
}
