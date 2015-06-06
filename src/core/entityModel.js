//import {addEntityInstances$, setEntityData$, deleteEntities$, duplicateEntities$, deleteAllEntities$ } from '../actions/entityActions'
import logger from '../utils/log'
let log = logger("entities")
log.setLevel("info")

import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge


/*setEntityData(data){
    log.info("setting entity data", data)

    if(!data) return

    let entity = data.entity
    let _entitiesById = this.state._entitiesById
    let tgtEntity     = _entitiesById[entity.iuid]
    delete data.entity

    for(let key in data){
      console.log("change", key)
      tgtEntity[key] = data[key]
    }
   

    if(!tgtEntity) return
    //tgtEntity. = color

    //FIXME : not sure
    let assemblyChildren = []
    for(let key in _entitiesById) {
      let value = _entitiesById[key]
      assemblyChildren.push( value )
    }
    this.setState({
      assemblies_main_children:assemblyChildren,
      _entitiesById:_entitiesById
    })

  }*/


function makeModification$(intent){

  /*register a new entity type*/
  let addEntityType$ = intent.addEntityType$ 
    .map((typeData) => (entitiesData) => {
      //log.info("adding entity type", type)
      let {type,typeUid} = typeData

      let entityTypes = entitiesData.types
      entityTypes[typeUid] = type

      //TODO: should it be part of the app's history 
      return entitiesData
    })

  /*TODO: implement*/
  /*let addEntityInstanceTo$ = intent.addEntityInstanceTo$
    ( instance , parent){
    let parent = parent || null

  }*/

  /*save a new entity instance*/
  let addEntities$ = intent.addEntities$
    .map((nentities) => (entitiesData) => {
      //log.info("adding entity instance", instance)

      let entities = nentities || []
      if(entities.constructor !== Array) entities = [entities]

      entitiesData.instances = entitiesData.instances.concat(entities)
      entities.map(entity=>{entitiesData.entitiesById[entity.iuid] = entity})

      //set selections
      entitiesData.selectedEntitiesIds = entities.map((entity)=>entity.iuid)
      return entitiesData
    })

  /*set entites properties*/
  let updateEntities$ = intent.setEntityData$
    .debounce(3)
    .map((data) => (entitiesData) => {
      //log.info("setting entity data", data)
      
      if(!data) return entitiesData

      let entity = data.entity
      let entitiesById = entitiesData.entitiesById
      let tgtEntity    = entitiesById[entity.iuid]
      delete data.entity

      if(!tgtEntity) return entitiesData

      for(let key in data){
        tgtEntity[key] = data[key]
      }

      entitiesById[entity.uid] = tgtEntity
      return entitiesData
    })

  /*remove an entity : it actually only 
  removes it from the active assembly*/
  let deleteEntities$ = intent.deleteEntities$
    .map((remEntitites) => (entitiesData) => {
      //log.info("removing entity instances", instances)
      //self.kernel.removeEntity(instance)

      //FIXME: not sure...., duplication of the above again
      let nEntities  =  entitiesData.instances
      let _tmp = remEntitites.map(entity=>entity.iuid)
      let outNEntities = nEntities.filter(function(entity){ return _tmp.indexOf(entity.iuid)===-1})

      entitiesData.instances = outNEntities

      remEntitites.map(entity=>{ delete entitiesData.entitiesById[entity.iuid] })

      //set selections
      entitiesData.selectedEntitiesIds = []

      return entitiesData
    })

  /*delete all entities from current entities*/
  let deleteAllEntities$ = intent.deleteAllEntities$
    .map(() => (entitiesData) => {
      entitiesData.instances = []
      entitiesData.entitiesById = {}
      //set selections
      entitiesData.selectedEntitiesIds = []
      return entitiesData
    })

  /*create duplicates of given entities*/
  let duplicateEntities$  = intent.duplicateEntities$
    .map((sources) => (entitiesData) => {

      let dupes = []

      sources.map(function(instance){
        let duplicate = self.kernel.duplicateEntity(instance)
        dupes.push( duplicate )
        //FIXME: this is redundant  
        //self.addEntityInstance(duplicate)
      })
      entitiesData.instances = entitiesData.instances.concat(dupes)
      return entitiesData
    })

  /*select given entities*/
  let selectEntities$ = intent.selectEntities$ 
    .map((sentities) => (entitiesData) => {

      log.info("selecting entitites",sentities)
      let entities = sentities || []
      if(entities.constructor !== Array) entities = [entities]

      let ids = entities.map( entity => entity.iuid)

      ////TODO: should it be serialized in history ?
      entitiesData.selectedEntitiesIds = ids
      return entitiesData
    })

  /*technically same as deleteAll , but kept seperate for clarity*/
  let resetEntities$ = intent.newDesign$
    .map((sentities) => (entitiesData) => {
      entitiesData.instances = []
      entitiesData.entitiesById = {}
      //set selections
      entitiesData.selectedEntitiesIds = []
      return entitiesData
    })

  /*let bla$ = intent.loadDesign$
    .map((sentities) => (entitiesData) => {
      console.log("testing")
      return entitiesData
    })*/

  return merge(
    addEntityType$,
    addEntities$,
    updateEntities$,
    deleteEntities$,
    deleteAllEntities$,
    duplicateEntities$,
    selectEntities$,

    resetEntities$
  )
}

function model(intent, source) {
  let source$ = source || Observable.just({instances:[],types:[]})

  let modification$ = makeModification$(intent)

  return modification$
    .merge(source$)
    .scan((entityData, modFn) => modFn(entityData))//combine existing data with new one
    .shareReplay(1)
}

export default model