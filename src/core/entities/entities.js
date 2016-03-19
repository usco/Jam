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


///helper functions
function reduceToIuidBasedHash(instances){
  return instances.reduce(function(prev,cur){
      prev[cur.id] = cur
      return prev
    },{})
}

/*add a new entity instance*/
function addInstances(state, {input,settings}){
  log.info("adding entity instance(s)", input)

  let entities = toArray(input)

  let instances = state.instances.concat(entities)
  let byId = reduceToIuidBasedHash(instances)

  state = mergeData( state, {instances, byId} )

  //set selections, if need be
  if(settings.autoSelectNewEntities){
    //FIXME !! issue with ordering of things: at this stage, state is not updated !!
    //selectEntities$( entities.map(i=>i.id) )
  }
  return state
}

/*remove an entity : it actually only
  removes it from the active assembly
*/
function deleteInstance(state, input){
  log.info("removing entities ", input)

  let instances = state.instances
    .filter( entity => (input.indexOf(entity.id)===-1) )
  let byId = reduceToIuidBasedHash(instances)

  state = mergeData( state, {instances, byId} )

  return state
}

/*delete all entities from current entities*/
function deleteAllInstances(state, input){
  log.info("removing all entities ")

  state = mergeData( state, {instances:[], byId:{} } )

  return state
}

//replace all existing data with new one: can be used in case of undo redos, loading etc
function replaceInstances(state, input){
  log.info("replacing entities data with",input)

  state = mergeData( state, input )

  return state
}

/*set entites properties*/
function updateInstances(state, input){
  log.info("updating entities with data", input)

  if(!input) return state
  let newData = toArray(input)

  let updatedEntities = newData
    .filter(e=>e.ids !== undefined)
    .map(function(entry){
      let id = entry.ids
      let tgtEntity = state.byId[id]
      tgtEntity = mergeData(tgtEntity, entry)
      return tgtEntity
    })
    .reduce(function(prev,cur){
      prev[cur.id] = cur
      return prev
    },{})

  let byId = mergeData(state.byId, updatedEntities)
  let instances = Object.keys(byId).map(key=>byId[key])

  state = mergeData( state, {instances, byId} )

  return state
}

/*create duplicates of given entities*/
function duplicateInstances(state, {input,settings}){
  log.info("duplicating entity instances", input)

  let sources = toArray(input)

  function duplicate(original){
    let doNotCopy = ["id","name"]
    let onlyCopy = ["cid","pos","rot","sca","color","typeUid"]

    let dupe = {
      id:generateUUID()
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

  let dupes = sources.map(duplicate)

  let instances = state.instances.concat(dupes)
  let byId = reduceToIuidBasedHash(instances)
  state = mergeData( state, {instances, byId} )

  //set selections, if need be
  //if(settings.autoSelectNewEntities) selectEntities$( dupes.map(i=>i.id) )

  return state
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
    })

  let _addInstances$ = intent.addInstances$
    .filter(exists)
    //splice in settings
    .withLatestFrom(intent.settings$,function(data,settings){
      return {nentities:data,settings}
    })
    .map(({nentities,settings}) => (entitiesData) => {
      return addInstances(entitiesData,{input:nentities,settings})
    })

  let _updateInstance$ = intent.updateInstance$
    .map((nData) => (entitiesData) => {
      return updateInstances(entitiesData,nData)
    })

  let _deleteInstances$ = intent.deleteInstances$
    .map((remEntitites) => (entitiesData) => {
      return deleteInstance(entitiesData, remEntitites)
    })
    .do( selectEntities$([]) ) //set selections

  let _deleteAllInstances$ = intent.deleteAllInstances$
    .map(() => (entitiesData) => {
      return deleteAllInstances(entitiesData)
    })
    .do( selectEntities$([]) ) //set selections

  let _duplicateInstances$  = intent.duplicateInstances$
    //splice in settings
    .withLatestFrom(intent.settings$,function(data,settings){
      return {sources:data,settings}
    })
    .map(({sources,settings}) => (entitiesData) => {
      return duplicateInstances(entitiesData, {input:sources,settings})
    })

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
