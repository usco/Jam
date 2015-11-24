import Rx from 'rx'
import {makeInternals, meshResources} from '../meshResources'
import {extractChanges} from '../../utils/diffPatchUtils'


export function entityTypeIntents(sources){
  let meshSources$ = sources.meshSources$
  let srcSources$  = sources.srcSources$

  //TODO: get rid of this
  let assetManager   = makeInternals()
  let meshResources$ = meshResources(meshSources$, assetManager)
  //meshResources$.subscribe(e=>console.log("meshResources",e))

  console.log("meshResources")
  //let entityInstance = undefined
  //return meshResources$.map(e=>e.mesh).map(testHack2).shareReplay(1)

  const clearTypes$  = Rx.Observable.never()
  const registerTypeFromMesh$ = meshResources$

  return {
    registerTypeFromMesh$
    , clearTypes$
  }
}

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