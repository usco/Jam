import Rx from 'rx'
const merge = Rx.Observable.merge
const just  = Rx.Observable.just
import {flatten} from 'ramda'

import {nameCleanup} from '../../utils/formatters'

import {combineLatestObj,replicateStream} from '../../utils/obsUtils'
import {generateUUID,exists,toArray} from '../../utils/utils'
import {mergeData} from '../../utils/modelUtils'

//entity components
import {makeCoreSystem} from '../../core/entities/components/core' 
import {makeTransformsSystem} from '../../core/entities/components/transforms' 
import {makeMeshSystem} from '../../core/entities/components/mesh' 
import {makeBoundingSystem} from '../../core/entities/components/bounds' 

import {addAnnotation} from '../../core/entities/annotations'

import {entityInstanceIntents} from '../../core/entities/entityIntents'

import {selectionsIntents} from './intents/selections'

import settings from    '../../core/settings'
import comments from    '../../core/comments'
import selections from  '../../core/selections'
import entityTypes from '../../core/entities/entityTypes'
import bom         from '../../core/bom'

import {remapEntityActions,remapCoreActions,
  remapMeshActions,remapTransformActions,remapBoundsActions} from './helpers'

 
 
function makeRegistry(instances$, types$){
  //register type=> instance & vice versa
  let base = {typeUidFromInstUid:{},instUidFromTypeUid:{}}

  instances$ = instances$.map(function(instances){
    let res = []
    Object.keys(instances).map(function(key){
      res.push( instances[key] )
    })
    return res
  })

  return combineLatestObj({instances$,types$})
    .map(function({instances, types}){

      let instUidFromTypeUid = instances
        .reduce(function(prev,instance){
          if(!prev[instance.typeUid]){
            prev[instance.typeUid] = []//instance.id
          }

          prev[instance.typeUid].push( instance.id )
          return prev
        },{})

      let typeUidFromInstUid = instances
        .reduce(function(prev,instance){
          prev[instance.id] = instance.typeUid
          return prev
        },{})

      return {instUidFromTypeUid,typeUidFromInstUid}
    })
}


export default function model(props$, actions, drivers){
  const DOM      = drivers.DOM
  const events   = drivers.events

  let entityActions = actions.entityActions

  const settings$      = settings( actions.settingActions, actions.settingsSources$ ) 
  const entityTypes$   = entityTypes( actions.entityTypeActions)
  const comments$      = comments( actions.commentActions)

  /*
  //addInstanceCandidates => -------------------------
  //addType               => --T----------------------
  */

  //TODO: go back to basics : some candidate have access to already exisiting types, some others not (first time)

  const addInstanceFromTypes$   = entityInstanceIntents(entityTypes$).addInstances$
  const addInstancesCandidates$ = entityActions.addInstanceCandidates$
    .withLatestFrom(entityTypes$,function(candidateData,entityTypes){
      let typeUid = entityTypes.meshNameToPartTypeUId[candidateData.meta.name]
      if(typeUid){
        let tData = entityTypes
          .typeData[typeUid]
        let addedInstanceTypeData = tData
        return [tData]
      }
      return undefined
    })
    .filter(exists)

  const addInstance$ = Rx.Observable.merge(
      //addInstanceFromTypes$
      addInstancesCandidates$
    )
    .filter(exists)
    .filter(d=>d.length>0)
    
    //.do(e=>console.log("addInstance",e))
    //.take(1)
    //.repeat()
    //.forEach(e=>console.log("entityInstanceIntents",e))
    


  //TODO : modify entityInstanceIntents
  const entityInstancesBase$  = /*entityActions
    .addInstanceCandidates$
    .withLatestFrom(entityTypes$,function(candidateData,entityTypes){
      //let cleanedName = nameCleanup( candidateData.resource.name )
      //here what we do is find types by mesh name, if any
      let typeUid = entityTypes.meshNameToPartTypeUId[candidateData.meta.name]
      if(typeUid){
        let tData = entityTypes
          .typeData[typeUid]


        let addedInstanceTypeData = tData
        return [tData]
      }
      return undefined
    })
    .filter(exists)*/
    addInstance$
    .map(function(newTypes){
      return newTypes.map(function(typeData){
        let instUid = generateUUID()
        let typeUid = typeData.id
        let instName = typeData.name+"_"+instUid

        let instanceData = {
          id:instUid
          ,typeUid
          ,name:instName
        }
        return instanceData
      })
    })
    .shareReplay(1)

  //create various components' baseis
  let componentBase$ = entityInstancesBase$
    .withLatestFrom(entityTypes$,function(instances,types){
      //console.log("instances",instances, "types",types)

      let data =  instances.map(function(instance){
        let instUid = instance.id
        let typeUid = instance.typeUid

        //is this a hack?
        let mesh = types.typeUidToTemplateMesh[typeUid]
        let bbox = mesh.boundingBox
        let zOffset = bbox.max.clone().sub(bbox.min)
        zOffset = zOffset.z/2
        bbox = { min:bbox.min.toArray(), max:bbox.max.toArray() }

        //injecting data like this is the right way ?
        mesh.material = mesh.material.clone()
        mesh = mesh.clone()
        
        return {
          instUid
          ,typeUid
          ,instance
          ,mesh
          ,zOffset
          ,bbox
        }
      })

      return data
    })
    .shareReplay(1)

  ///main stuff  

  //annotations
  let addAnnotations$ = addAnnotation(actions.annotationsActions, settings$)
    .map(toArray)
  
  const proxySelections$ = new Rx.ReplaySubject(1)

  entityActions        = remapEntityActions(entityActions, proxySelections$)

  let coreActions      = remapCoreActions(entityActions, componentBase$, proxySelections$, addAnnotations$)
  let meshActions      = remapMeshActions(entityActions, componentBase$, proxySelections$)
  let transformActions = remapTransformActions(entityActions, componentBase$, proxySelections$)
  let boundActions     = remapBoundsActions(entityActions, componentBase$, proxySelections$)

  let {core$}          = makeCoreSystem(coreActions)
  let {meshes$}        = makeMeshSystem(meshActions)
  let {transforms$}    = makeTransformsSystem(transformActions)
  let {bounds$}        = makeBoundingSystem(boundActions)


  const typesInstancesRegistry$ =  makeRegistry(core$, entityTypes$)  
  const selections$  = selections( selectionsIntents({DOM,events}, typesInstancesRegistry$) )
    .merge(coreActions.removeComponents$.map(a=> ({instIds:[],bomIds:[]}) )) //after an instance is remove, unselect

  const currentSelections$ = selections$//selections$.pluck("instIds")
    .withLatestFrom(typesInstancesRegistry$,function(selections,registry){
      return selections.instIds.map(function(id){
        const typeUid = registry.typeUidFromInstUid[id]
        return {id, typeUid}
      })
    })
    .distinctUntilChanged()
    .shareReplay(1)

  //close some cycles
  replicateStream(currentSelections$,proxySelections$)


  //BOM
  const addBomEntries$ = entityInstanceIntents(entityTypes$)
    .addInstances$//in truth this just mean "a new type was added"
    .map(function(typeDatas){
      return typeDatas.map(function({id,name}){
        return {id,name,qty:0,version:"0.0.1",unit:"QA",printable:true}
      })
    })

  const increaseBomEntries$ = coreActions
    .createComponents$
    .map(function(data){
      return data
        .map(v=>v.value.typeUid)
        .map(function(id){
          return {offset:1,id}
        })
    })
    .merge(
      coreActions.duplicateComponents$
      .map(function(data){
        return data.map(function(dat){
          return {offset:1,id:dat.typeUid}
        })
      })
    )

  const decreaseBomEntries$ = coreActions
    .removeComponents$
    .do(d=>console.log("removing",d))
    .map(function(data){
      return data
        .filter(d=>d.id !== undefined)
        .map(d=>d.typeUid)
        .map(function(id){
          return {offset:-1,id}
        })
    })

  const updateBomEntriesCount$ = merge(
    increaseBomEntries$
    , decreaseBomEntries$
  )

  let clearBomEntries$ = merge(
    entityActions.reset$
  )

  const updateBomEntries$ = actions.bomActions.updateBomEntries$

  let bomActions = mergeData( {addBomEntries$, updateBomEntriesCount$, clearBomEntries$, updateBomEntries$} )
  const bom$ = bom(bomActions)

  //not entirely sure, we need a way to observe any fetch/updload etc operation
  const operationsInProgress$ = actions.progress.combinedProgress$.startWith(undefined)
 
  //////other data
  const appData$ = drivers.appMeta

  //combine all the above to get our dynamic state
  const state$ = combineLatestObj({
    
    selections$
    ,bom$
    ,comments$

    ,operationsInProgress$

    //entity components
    ,core$
    ,transforms$
    ,meshes$

    ,appData$
    ,settings$ 

  }).shareReplay(1)


  return state$
}