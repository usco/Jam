import {extractChanges} from '../../utils/diffPatchUtils'

export function entityInstanceIntents(entityTypes$){
  
  const baseOps$ = entityTypes$
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
  .shareReplay(1)

  const addInstances$ = baseOps$
    .pluck("added")
  
  return {
    addInstances$
  }
}