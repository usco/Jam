import {toArray} from '../../utils/utils'
import {hasEntity, getEntity} from '../../utils/entityUtils'

function extractEntities(data){
  return data.filter(hasEntity).map(getEntity).map(e=>e.iuid)
}

export function reverseSelections(intents, entities$){
  Array.prototype.flatMap = function(lambda) { 
    return Array.prototype.concat.apply([], this.map(lambda)) 
  }

  //select bom entries from entities
  let selectBomEntries$ = intents
    .selectEntities$
    .withLatestFrom(entities$,function(entityIds,entities){
      return entityIds.map(id=>entities.byId[id].typeUid)
    })
    

  //select entities from bom entries
  let selectEntities$ = intents
    .selectBomEntries$
    .withLatestFrom(entities$,function(bomIds,entities){
      return bomIds.flatMap(function(typeUid){
        return entities.instances.filter( i => i.typeUid === typeUid ).map( i => i.iuid )
      })
    })

  //selectEntities$.subscribe(e=>console.log("for these bomEntries, instIds are",e))
  //selectBomEntries$.subscribe(e=>console.log("for these entities, typeUids are",e))

  selectEntities$   = selectEntities$.merge(intents.selectEntities$)
  selectBomEntries$ = selectBomEntries$.merge(intents.selectBomEntries$)

  return{
    selectEntities$
    ,selectBomEntries$
  }
}


export function selectionsIntents(interactions){
  let selectEntities$ = interactions.get(".glview","selectedMeshes$")
    .pluck("detail")
    .map(extractEntities)

  let selectBomEntries$ = interactions.get(".bom","entryTaps$")
    .pluck("detail")
    .map(toArray)

  return{
    selectEntities$
    ,selectBomEntries$
  }
}