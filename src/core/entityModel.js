import {
  addEntityInstances$, 
  setEntityData$, 
  deleteEntities$, 
  duplicateEntities$, 
  deleteAllEntities$,
  selectEntities$
   } from '../actions/entityActions'

import logger from '../utils/log'
let log = logger("entities")
log.setLevel("info")

import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import {generateUUID} from 'usco-kernel2/src/utils'

///defaults, what else ?
const defaults = {
  instances:[],
  selectedEntitiesIds:[],

  //secondary storage of instances, for (flat) faster/simpler access
  entitiesById:{}
}

/*
const partTemplate = {
      name: data.name,
      iuid: generateUUID(),
      typeUid: undefined,
      color: "#07a9ff",
      pos: [
          0,
          0,
          0,
      ],
      rot: [
          0,
          0,
          0
      ],
      sca: [
          1,
          1,
          1
      ],
      bbox:{
        min:[0,0,0],
        max:[0,0,0]
      }
  }
*/


///helper methods

//////

function makeModification$(intent){

  /*TODO: implement*/
  /*let addEntityInstanceTo$ = intent.addEntityInstanceTo$
    ( instance , parent){
    let parent = parent || null

  }*/

  /*let _createEntityInstance$ = intent.createEntityInstance$
    .map((data) => (entitiesData) => {

      let h = data.bbox.max[2]  - data.bbox.min[2]

        let partInstance =
        {
            name: data.name,
            iuid: generateUUID(),
            typeUid: data.typeUid,
            color: "#07a9ff",
            pos: [
                0,
                0,
                h/2
            ],
            rot: [
                0,
                0,
                0
            ],
            sca: [
                1,
                1,
                1
            ],
            bbox:data.bbox
        }

    })*/


  /*save a new entity instance*/
  let _addEntities$ = intent.addEntities$
    .map((nentities) => (entitiesData) => {
      //log.info("adding entity instance", instance)

      let entities = nentities || []
      if(entities.constructor !== Array) entities = [entities]

      entitiesData.instances = entitiesData.instances.concat(entities)
      entities.map(entity=>{entitiesData.entitiesById[entity.iuid] = entity})

      //set selections
      selectEntities$( entities )//entities.map((entity)=>entity.iuid))
      //entitiesData.selectedEntitiesIds = entities.map((entity)=>entity.iuid)
      return entitiesData
    })

  /*set entites properties*/
  let _updateEntities$ = intent.setEntityData$
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

      entitiesById[entity.iuid] = tgtEntity
      return entitiesData
    })

  /*remove an entity : it actually only 
  removes it from the active assembly*/
  let _deleteEntities$ = intent.deleteEntities$
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
  let _deleteAllEntities$ = intent.deleteAllEntities$
    .map(() => (entitiesData) => {
      entitiesData.instances = []
      entitiesData.entitiesById = {}
      //set selections
      entitiesData.selectedEntitiesIds = []
      return entitiesData
    })

  /*create duplicates of given entities*/
  let _duplicateEntities$  = intent.duplicateEntities$
    .map((sources) => (entitiesData) => {
      log.info("duplicating entity instances", sources)
      let dupes = []


      function duplicate(original){
        let doNotCopy = ["iuid","name"]
        let onlyCopy = ["pos","rot","sca","color","typeUid"]

        let dupe = {
          iuid:generateUUID()
        }
        for(let key in original ){
          if( onlyCopy.indexOf( key ) > -1 ){
            dupe[key] = JSON.parse(JSON.stringify(original[key])) //Object.assign([], originalEntity[key] )
          }
        }
        //FIXME : needs to work with all entity types
        //dupe.typeName + "" + ( this.partRegistry.partTypeInstances[ dupe.typeUid ].length - 1)
        dupe.name = original.name + "" //+ ( this.partRegistry.partTypeInstances[ dupe.typeUid ].length - 1)
        return dupe
      }
      dupes = sources.map(duplicate)

      entitiesData.instances = entitiesData.instances.concat(dupes)
      return entitiesData
    })

  /*select given entities*/
  let _selectEntities$ = intent.selectEntities$ 
    .distinctUntilChanged()//we do not want to be notified multiple times in a row for the same selections
    .map((sentities) => (entitiesData) => {
      //log.info("selecting entitites",sentities)

      let entities = sentities || []
      if(entities.constructor !== Array) entities = [entities]

      let ids = entities.map( entity => entity.iuid)

      ////TODO: should it be serialized in history ?
      entitiesData.selectedEntitiesIds = ids
      return entitiesData
    })

  /*technically same as deleteAll , but kept seperate for clarity*/
  let _resetEntities$ = intent.newDesign$
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
    _addEntities$,
    _updateEntities$,
    _deleteEntities$,
    _deleteAllEntities$,
    _duplicateEntities$,
    _selectEntities$,

    _resetEntities$
  )
}

function model(intent, source) {
  let source$ = source || Observable.just(defaults)

  let modification$ = makeModification$(intent)

  return modification$
    .merge(source$)
    .scan((entityData, modFn) => modFn(entityData))//combine existing data with new one
    //.distinctUntilChanged()
    .shareReplay(1)
}

export default model