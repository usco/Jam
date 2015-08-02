

/*
rawEntitySelect =
                => magicFunction! => coherentSelections
rawBomSelect    =
*/

//perhaps we need all 3 of these ?
//selectEntitiesByInstId =>
//selectEntitiesByTypeId =>
//selectBomEntries

export default function selections(intents, data) {
  //ugh
  let {bom$,entities$} = data

  let selectedBomEntries$ = intents.selectedBomEntries$
  let selectedEntities$   = intents.selectedEntities$

  //TODO: if we seperate selection by instance id from selection by type id, we don't need entities injected anymore
  //and the logic can be externalized

  //selection bomentry => instances
  let entitiesToSelectFromBom$ = 
    selectedBomEntries$
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
  let selectEntities$ = intents.selectEntities$
  //entities$.pluck("selectionIds").distinctUntilChanged()

  let bomEntriesToSelect$ = 
    entities$
    .withLatestFrom(bom$,function(entities,bom){

      let iuids = entities.selectedIds
      let selections = iuids.map(function(iuid){
        let entity  = entities.byId[iuid]
        let typeUid =  undefined
        if(entity) typeUid = entity.typeUid
        return typeUid//bom.byId[typeUid]
      })
      //.filter( bom.selectedEntries.indexOf(typeUid)  )
      //GUARD !!
      console.log("selecting bom entries from entities", selections)
      return selections
    })


  return {
    entitiesToSelect$,
    bomEntriesToSelect$
  }
}