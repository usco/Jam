import {toArray,exists} from '../../utils/utils'
import {hasEntity, getEntity} from '../../utils/entityUtils'

function extractEntities(data){
  return data.filter(hasEntity).map(getEntity).map(e=>e.iuid)
}

export function reverseSelections(intents, idsMapper$){
  Array.prototype.flatMap = function(lambda) { 
    return Array.prototype.concat.apply([], this.map(lambda)) 
  }

  //what we want is actually typeUid!
  //so typeUidFromInstUid()

  //select bom entries from entities
  let selectBomEntries$ = intents
    .selectEntities$
    .withLatestFrom(idsMapper$,function(entityIds,idsMapper){
      return entityIds.map(id=>idsMapper.typeUidFromInstUid[id]).filter(exists)
    })
    //.do(e=>console.log("selectedBomEntries",e))

    
  //select entities from bom entries
  //in this case instUidFromTypeUid
  
  let selectEntities$ = intents
    .selectBomEntries$ 
    .withLatestFrom(idsMapper$,function(bomIds,idsMapper){
      return bomIds.map(id=>idsMapper.instUidFromTypeUid[id]).filter(exists)
    })
    //.do(e=>console.log("selectedEntities",e))
    
    /*.withLatestFrom(entities$,function(bomIds,entities){
      return bomIds.flatMap(function(typeUid){
        return entities.instances.filter( i => i.typeUid === typeUid ).map( i => i.iuid )
      })
    })*/
  //selectEntities$.subscribe(e=>console.log("for these bomEntries, instIds are",e))
  //selectBomEntries$.subscribe(e=>console.log("for these entities, typeUids are",e))

  selectEntities$   = selectEntities$.merge(intents.selectEntities$)
  selectBomEntries$ = selectBomEntries$.merge(intents.selectBomEntries$)

  return{
    selectEntities$
    ,selectBomEntries$
  }
}


export function selectionsIntents(drivers, idsMapper$){
  //console.log("selectionsIntents")
  let selectEntities$ = drivers.events.select("gl")//.events("selectedMeshes$")
    .flatMap(e=>e.selectedMeshes$)
    .filter(exists)
    .map(extractEntities)
    .distinctUntilChanged()
    .shareReplay(1)

  let selectBomEntries$ = drivers.events.select("bom")//.events("entryTaps$")
    .flatMap(e=>e.entryTapped$)
    .filter(exists)
    .map(toArray)
    .distinctUntilChanged()
    .shareReplay(1)

  return reverseSelections({
     selectEntities$
    ,selectBomEntries$
  },idsMapper$)

}