import Rx from 'rx'
const merge = Rx.Observable.merge
import {mergeData} from '../../../utils/modelUtils'

import {extractChanges} from '../../../utils/diffPatchUtils'

export function entityInstanceIntents(entityTypes$){
  
  const addInstances$ = entityTypes$
    //.distinctUntilChanged()//no worky ?
    .pluck("typeData")
    .scan(function(acc, x){
      let cur  = x
      let prev = acc.cur

      cur = Object.keys(cur).map(function(key){
        return cur[key]
      })      
      return {cur,prev} 
    },{prev:undefined,cur:undefined})
    .map(function(typeData){
      let {cur,prev} = typeData

      let changes = extractChanges(prev,cur)
    return changes
  })
  .pluck("added")
  .shareReplay(1)
  
  return {
    addInstances$
  }
}


export default function bomIntent(drivers, entityTypes$, coreActions, entityActions, actions){

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