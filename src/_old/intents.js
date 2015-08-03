import Rx from 'rx'
import {Observable, exists} from '../utils/obsUtils'
let merge = Rx.Observable.merge
import {first,toggleCursor,getEntity,hasEntity,extractMeshTransforms} from '../utils/otherUtils'
import {itemsEqual} from '../utils/utils'

import combineTemplate from 'rx.observable.combinetemplate'


////////////////////////////
export default function intent(interactions) {

  function toArray (vec){
    return vec.toArray().slice(0,3)
  }

  let objTransform$ = interactions.objectsTransforms$
    .debounce(16.6666)
    .filter(hasEntity)

  let entity = objTransform$.map(getEntity)//.startWith({typeUid:undefined,iuid:undefined})//temporary
    .distinctUntilChanged(null, itemsEqual)

  let eId = objTransform$.map(getEntity).pluck('iuid').startWith("-1")
    .distinctUntilChanged(null, itemsEqual)
  let pos = objTransform$.pluck('position').map(toArray).startWith([0,0,0])
    .distinctUntilChanged(null, itemsEqual)
  let rot = objTransform$.pluck('rotation').map(toArray).startWith([0,0,0])
    .distinctUntilChanged(null, itemsEqual)
  let sca = objTransform$.pluck('scale').map(toArray).startWith([1,1,1])
    .distinctUntilChanged(null, itemsEqual)

   
  let endTranforms$ = combineTemplate(
    {
      iuid: eId, 
      entity,
      pos:pos,
      rot:rot,
      sca:sca
    })
  
  ////////
  let appState$ = interactions.appState$ //???ugh, no, no no !


  let entitiesToSelect$ = interactions.selectedMeshes$//selectedMeshes is an intent, not an interaction
    .defaultIfEmpty([])
    //only select entities when no tool is selected 
    .onlyWhen(appState$, appState => !exists(appState.activeTool) )
    .map(
      (meshes)=>( meshes.filter(hasEntity).map(getEntity).map(i=>i.iuid) )
    )

  
  let selectedBomEntries$ = interactions.selectedBomEntries$ //this is be an intent, from an interaction

  //ugh
  let {bom$,entities$} = interactions

  //TODO: if we seperate selection by instance id from selection by type id, we don't need entities injected anymore
  //and the logic can be externalized

  //selection bomentry => instances
  let entitiesToSelectFromBom$ = 
    selectedBomEntries$
    .withLatestFrom(bom$,(e,bom)=>bom)
    .map( bom => bom.selectedEntries)
    .withLatestFrom(entities$,function(typeUids,entities){

      //fixme use flat data structure (instances will not be)
      let selections = typeUids.flatMap(function(typeUid){
        return entities.instances.filter( i => i.typeUid === typeUid ).map( i => i.iuid )
      })
      
      console.log("selecting entities from bom", selections)
      return selections
    })   

  entitiesToSelect$ = merge(
    entitiesToSelect$,
    entitiesToSelectFromBom$
  )
  
  //selection instances => bom entry
  let selectEntities$ = interactions.selectEntities$ //this be an intent, from an interaction
  //entities$.pluck("selectionIds").distinctUntilChanged()

  let bomEntriesToSelect$ = 
    selectEntities$
    .withLatestFrom(entities$,(e,entities)=>entities)
    .withLatestFrom(bom$,function(entities,bom){

      console.log("selecting bom stuff")
      let iuids = entities.selectedIds
      let selections = iuids.map(function(iuid){
        let entity  = entities.byId[iuid]
        let typeUid =  undefined
        if(entity) typeUid = entity.typeUid
        return typeUid//bom.byId[typeUid]
      })
      //.filter( bom.selectedEntries.indexOf(typeUid)  )
      //GUARD !!
      //if(selections.sort() === )
      console.log("selecting bom entries from entities", selections)
      return selections
    })


  return {
    entityTransforms$:endTranforms$,
    entitiesToSelect$,
    bomEntriesToSelect$
  }
}
