import Rx from 'rx'
import {Observable, exists} from '../utils/obsUtils'
let merge = Rx.Observable.merge
import {first,toggleCursor,getEntity,hasEntity,extractMeshTransforms} from '../utils/otherUtils'


////////////////////////////
export function Intent(interactions) {

  function attributesToArrays(attrs){
    let output= {}
    for(let key in attrs){
      output[key] = attrs[key].toArray()
    }
    //special case for rotation
    if("rot" in attrs)
    {
      output["rot"] = output["rot"].slice(0,3)
    }
    return output
  }

  //debounce 16.666 ie 60 fps ?
  let rawTranforms     =  interactions.objectsTransforms$
    .debounce(16.6666)
    .filter(hasEntity)
    .share()

  let objectTransforms$ = rawTranforms 
    .map(extractMeshTransforms)
    .map(attributesToArrays)
    .take(1)

  let objectsId$ = rawTranforms
    .map(getEntity)
    .take(1)

  /*let entityTransforms$ = Observable.forkJoin(
    objectTransforms$,
    objectsId$
  )*/
  let entityTransforms$ = Observable
    .combineLatest(objectTransforms$,objectsId$,
      function(transforms,entity){
        console.log("transforms",entity)
        return{
          entity:entity,
          pos:transforms.pos,
          rot:transforms.rot,
          sca:transforms.sca
        }
      })
  .repeat()

  /*let entitiesOnly = hasEntity 
    let toArray = attributesToArrays

    let objTransform$ = objectTransforms
    .debounce(16)
    .filter(entitiesOnly)
 
    let eId = objTransform$.map(getEntity).pluck('iuid').startWith(-1)
    let pos = objTransform$.pluck('position').map(toArray).startWith([0,0,0])
    let rot = objTransform$.pluck('rotation').map(toArray).startWith([0,0,0])
    let sca = objTransform$.pluck('scale').map(toArray).startWith([0,0,0])
     
    let endTranforms = combineTemplate(
      {entityId:eId, 
       pos:pos,
       rot:rot,
       sca:sca}
    ).subscribe(function(value){
      console.log("transforms value",JSON.stringify(value))
    })*/
  
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
    entityTransforms$,
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