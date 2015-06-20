import Rx from 'rx'
import {Observable, exists} from '../utils/obsUtils'
let merge = Rx.Observable.merge
import {first,toggleCursor,getEntity,hasEntity,extractMeshTransforms} from '../utils/otherUtils'
import combineTemplate from 'rx.observable.combinetemplate'


function itemsEqual(a,b){
  //perhaps an immutable library would not require such horrors?
  if(JSON.stringify(a)===JSON.stringify(b)){
    return true
  }
  return false
}


////////////////////////////
export function Intent(interactions) {

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
      (meshes)=>( meshes.filter(hasEntity).map(getEntity) )
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
        return entities.instances.filter( i => i.typeUid === typeUid )//.map( i => i.iuid )
      })
      
      console.log("selecting entities from bom", selections)
      return selections
    })   

  entitiesToSelect$ = merge(
    entitiesToSelect$,
    entitiesToSelectFromBom$
  )
  /*
  //selection instances => bom entry
  let selectsBomFromInsts$ = 
    selectEntities$
    .withLatestFrom(entities$,(e,entities)=>entities)
    //entities$
    //.map( entities => entities.selectedEntitiesIds)
    .withLatestFrom(bom$,function(entities,bom){

      let iuids = entities.selectedEntitiesIds
      let selections = iuids.map(function(iuid){
        let entity  = entities.entitiesById[iuid]
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
    .subscribe(function(data){
      selectBomEntries2$(data)
    })*/


  return {
    entityTransforms$:endTranforms$,
    entitiesToSelect$
    //bomEntriesToSelect$
  }
}

//keyboard experiment
/*
function setKeyBidings( element ){
  //based on http://qiita.com/jdeseno/items/72e12a5fa815b52f95e2
  // US keyboard
  let keycodes = {
    48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9",
    65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g",
    72: "h", 73: "i", 74: "j", 75: "k", 76: "l", 77: "m", 78: "n",
    79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u",
    86: "v", 87: "w", 88: "x", 89: "y", 90: "z"
  }
  let source = Rx.Observable.fromEvent(element, 'keydown')
  let subscription = source
     .map(function(e) {
        return keycodes[e.keyCode]
      })
     .filter(function(key) {
       return !!key
     })
     .subscribe(function(key) {
       console.log('keydown', key)
     });

}

let rxjsTrap = {

  bind(keyCombo){

  }
}*/