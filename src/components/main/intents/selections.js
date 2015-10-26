import {toArray,exists} from '../../../utils/utils'
import {hasEntity, getEntity} from '../../../utils/entityUtils'
import {flatten,equals} from 'Ramda'

function extractEntities(data){
  return data.filter(hasEntity).map(getEntity).map(e=>e.iuid)
}

export function reverseSelections(intents, idsMapper$){

  Array.prototype.flatMap = function(lambda) { 
    return Array.prototype.concat.apply([], this.map(lambda)) 
  }

  //what we want is actually typeUid!
  //select bom entries from entities
  const selectBomEntries$ = intents
    .selectEntities$
    .do(e=>console.log("reversing instance selections to selectBomEntries"))
    .withLatestFrom(idsMapper$,function(entityIds,idsMapper){
      return flatten( entityIds.map(id=>idsMapper.typeUidFromInstUid[id]) ).filter(exists)
    })
    //.do(e=>console.log("selectedBomEntries",e))
    .merge(intents.selectBomEntries$)
    
  //select entities from bom entries  
  const selectEntities$ = intents
    .selectBomEntries$ 
    .do(e=>console.log("reversing BOM selections to selectEntities"))
    .withLatestFrom(idsMapper$,function(bomIds,idsMapper){ 
      return flatten( bomIds.map(id=>idsMapper.instUidFromTypeUid[id]) ).filter(exists)
    })
    //.do(e=>console.log("selectedEntities",e))
    .merge(intents.selectEntities$)
    
    
  return{
    selectEntities$:selectEntities$.distinctUntilChanged(null,equals)
    ,selectBomEntries$:selectBomEntries$.distinctUntilChanged(null,equals)
  }
}


export function selectionsIntents(drivers, idsMapper$){
  
  let selectEntities$ = drivers.events.select("gl").events("selectedMeshes$")
    .map(extractEntities)
    .do(e=>console.log("gl select2",e))
    .map(toArray)
    .shareReplay(1)

  let selectBomEntries$ = drivers.events.select("bom").events("entryTapped$")
    .map(toArray)
    .do(e=>console.log("bom select2",e))
    .shareReplay(1)

  return reverseSelections({
     selectEntities$
    ,selectBomEntries$
  },idsMapper$)

}