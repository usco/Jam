//partStream:
//quadruplets? 
//mesh(bin),source, params , metadata, 

import {
  addEntityInstances$, 
  updateInstance$, 
  deleteInstances$, 
  duplicateInstances$, 
  deleteAllInstances$,
  selectEntities$
   } from './actions'


import {exists} from '../../utils/obsUtils'
import {mergeData} from '../../utils/modelUtils'

import logger from '../../utils/log'
let log = logger("entities")
log.setLevel("info")

import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import {generateUUID} from 'usco-kernel2/src/utils'
import {toArray} from '../../utils/utils'

///defaults, what else ?
const defaults = {
  instances:[],
  //secondary storage of instances, for (flat) faster/simpler access
  byId:{}
}

/*
const partTemplate = {
      name: "",
      iuid: generateUUID(),
      typeUid: undefined,
      color: "#07a9ff",
      components:{}
  }*/

//just experimenting with thoughts about component based system
let partComponents = []

function makeTransformComponent(){
  return  {
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
  }
}

function makeBoundingComponent(){
  return {
    min:[0,0,0],
    max:[0,0,0]
  }
}


///helper methods

function deleteInstance(state, input){
  log.info("removing entities ", input)

  let instances = state.instances
    .filter( entity => (input.indexOf(entity.iuid)===-1) )
  let byId = instances.map(i=>i.iuid)

  state = mergeData( state, {instances,byId} )

  //set selections
  selectEntities$([])

  return state
}

function deleteAllInstances(state, input){
  log.info("removing all entities ")

  state = mergeData( state, {instances:[],byId:{} } )
  
  //set selections
  selectEntities$([])

  return state
}

function replaceInstances(state, input){
  log.info("replacing entities data with",input)

  state = mergeData( state, input )

  selectEntities$([])
  return outputData
}

function updateInstances(state, {input,settings}){
  log.info("updating entities with data", input)

  //FIXME , immutable
  let newData = toArray(input)
  
  let outputData = Object.assign({},state)
  if(!newData) return outputData

  let byId = outputData.byId

  /*newData.map(function(entry){
    let iuid = entry.iuids
    if(!iuid){
      return undefined
    }
    let tgtEntity    =  Object.assign({}, byId[iuid] )
    if(!tgtEntity){
      return undefined
    }

    for(let key in entry){
      tgtEntity[key] = entry[key]
    }

    //why is this even needed ?
    delete byId[iuid]
    outputData.instances = outputData.instances.filter(inst => inst.iuid !== iuid)

    outputData.instances.push( tgtEntity)
    outputData.byId[iuid] = tgtEntity
  })*/

  return state
}
  
function duplicateInstances(state, input){
  let sources = input
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
        dupe[key] = JSON.parse(JSON.stringify(original[key])) 
      }
    }
    //FIXME : needs to work with all entity types
    dupe.name = original.name + "" 
    return dupe
  }
  dupes = sources.map(duplicate)

  entitiesData.instances = entitiesData.instances.concat(dupes)

  dupes.map(function(dupe){
    entitiesData.byId[dupe.iuid] = dupe
  })
   
  //set selections, if need be
  if(settings.autoSelectNewEntities) selectEntities$( entitiesData.instances.map(i=>i.iuid) )

  return entitiesData
}



//////

function makeModification$(intent){

  /*TODO: implement*/
  /*let addEntityInstanceTo$ = intent.addEntityInstanceTo$
    ( instance , parent){
    let parent = parent || null

  }*/

  let _createInstance$ = intent.createInstance$
    .map((data) => (entitiesData) => {

      let h = data.bbox.max[2]  - data.bbox.min[2]

        let partInstance =
        {
            name: data.name,
            iuid: generateUUID(),
            typeUid: data.typeUid,
            color: "#07a9ff",
            pos: [ 0, 0, h/2 ],
            rot: [ 0, 0, 0 ],
            sca: [ 1, 1, 1 ],
            bbox:data.bbox
        }
    })


  /*add a new entity instance*/
  let _addInstances$ = intent.addInstances$
    .filter(exists)
    //splice in settings
    .withLatestFrom(intent.settings$,function(data,settings){
      return {nentities:data,settings}
    })
    .map(({nentities,settings}) => (entitiesData) => {
      //log.info("adding entity instance(s)", nentities)

      let entities = toArray(nentities)

      entitiesData.instances = entitiesData.instances.concat(entities)
      let entityIds = entities.map( function(entity) {
        entitiesData.byId[entity.iuid] = entity
        return entity.iuid
      })
      

      //set selections, if need be
      if(settings.autoSelectNewEntities){
        selectEntities$( entities.map(i=>i.iuid) )
      }

      return entitiesData
    })

  /*set entites properties*/
  let _updateInstance$ = intent.updateInstance$
    .map((nData) => (entitiesData) => {
      return updateInstance(entitiesData,nData)
    })

  /*remove an entity : it actually only 
  removes it from the active assembly*/
  let _deleteInstances$ = intent.deleteInstances$
    .map((remEntitites) => (entitiesData) => {
      return deleteInstance(entitiesData, remEntitites)
    })

  /*delete all entities from current entities*/
  let _deleteAllInstances$ = intent.deleteAllInstances$
    .map(() => (entitiesData) => {
      return deleteAllInstances(entitiesData)
    })

  /*create duplicates of given entities*/
  let _duplicateInstances$  = intent.duplicateInstances$
    //splice in settings
    .withLatestFrom(intent.settings$,function(data,settings){
      return {sources:data,settings}
    })
    .map(({sources,settings}) => (entitiesData) => {
      return duplicateInstances(entitiesData, {input:sources,settings})
    })

  //replace all existing data with new one: can be used in case of undo redos, loading etc
  let _replaceAll$ = intent.replaceAll$
    .map((newData) => (existingData) => {
      return replaceInstances(entitiesData, newData)
    })

  //FIXME : in parts ?
  /*let foo$ = new Rx.Subject()
  let rescaleBBox$ = foo$
    .map((newData) => (existingData) => {
      //let rescaleVertices = require('rescale-vertices')
    })*/

  return merge(
    _addInstances$
    ,_updateInstance$
    ,_deleteInstances$
    ,_deleteAllInstances$
    ,_duplicateInstances$
    
    ,_createInstance$
    ,_replaceAll$

  )
}

function entities(intent, source) {
  let source$ = source || Observable.just(defaults)
  let modification$ = makeModification$(intent)

  return modification$
    .merge(source$)
    .scan((entityData, modFn) => modFn(entityData))//combine existing data with new one
    //.distinctUntilChanged()
    .shareReplay(1)
}

export default entities


//just an idea: listing of available actions
let availableActions = {
  "delete"   :deleteInstances$
  ,"deleteAll":deleteAllInstances$
  ,"duplicate":duplicateInstances$
}

export {availableActions}