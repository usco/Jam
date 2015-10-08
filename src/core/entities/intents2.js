import {Rx} from '@cycle/core'
import {makeInternals, meshResources, entityInstanceFromPartTypes} from '../tbd0'
import {extractChanges} from '../../utils/diffPatchUtils'


export function entityTypeIntents(sources){
  let meshSources$ = sources.meshSources$
  let srcSources$ = sources.srcSources$

  //TODO: get rid of this
  let assetManager = makeInternals()
  let meshResources$ = meshResources(meshSources$, assetManager)
  //meshResources$.subscribe(e=>console.log("meshResources",e))

  function testHack2(mesh){
    mesh.position.set(0, 0, 0)
    return mesh
  }
  //let entityInstance = undefined
  //return meshResources$.map(e=>e.mesh).map(testHack2).shareReplay(1)

  const clearTypes$  = Rx.Observable.never()
  const registerTypeFromMesh$ = meshResources$

  return {
    registerTypeFromMesh$
    , clearTypes$
  }
}

export function instanceIntents(entityTypes$){
  const baseOps$ = entityTypes$
    //.distinctUntilChanged()//no worky ?
    .pluck("typeData")
    .scan({prev:undefined,cur:undefined},function(acc, x){
      let cur  = x
      let prev = acc.cur

      cur = Object.keys(cur).map(function(key){
        return cur[key]
      })      
      return {cur,prev} 
    })
    .map(function(typeData){
      let {cur,prev} = typeData

      let changes = extractChanges(prev,cur)
      console.log("changes",changes)
    return changes
  })

  const addInstances$ = baseOps$
    .pluck("added")
  
  return {
    addInstances$
  }
}