import Rx from 'rx'
const {merge,just,fromArray} = Rx.Observable
import {flatten, find, propEq, head} from 'ramda'

import {nameCleanup} from '../../utils/formatters'

import {combineLatestObj,replicateStream} from '../../utils/obsUtils'
import {generateUUID,exists,toArray} from '../../utils/utils'
import {mergeData} from '../../utils/modelUtils'

//entity components
import {makeMetaSystem} from '../../core/entities/components/meta'
import {makeTransformsSystem} from '../../core/entities/components/transforms'
import {makeMeshSystem} from '../../core/entities/components/mesh'
import {makeBoundingSystem} from '../../core/entities/components/bounds'

import {addAnnotation} from '../../core/entities/annotations'

import {remapEntityActions,remapMetaActions,
  remapMeshActions,remapTransformActions,remapBoundsActions} from '../../core/entities/utils'

import {selectionsIntents} from './intents/selections'

import settings from    '../../core/settings/settings'
import comments from    '../../core/comments'
import selections from  '../../core/selections'
import entityTypes from '../../core/entities/types'
import bom         from '../../core/bom/index'
import bomIntents from '../../core/bom/intents'

import {authToken} from '../../core/sources/addressbar.js'


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

  /*possible sources of instances
    directly:
    - addressBar
    - postMessage
    - drag & drop
    Indirectly:
      - duplicates of other instances
  */


export default function model(props$, actions, sources){
  const DOM      = sources.DOM
  const events   = sources.events

  let entityActions = actions.entityActions

  const settings$      = settings( actions.settingActions )
  const entityTypes$   = entityTypes( actions.entityActions )
  const comments$      = comments( actions.commentActions )

  /*
  //addInstanceCandidates => -------------------------
  //addType               => --T----------------------
  */

  //we FILTER all candidates/certains by their "presence" in the types list

  //TODO: go back to basics : some candidate have access to already exisiting types, some others not (first time)
  const addInstancesCandidates$ = entityActions.addInstanceCandidates$
    //.filter(data=>data.meta.id === undefined)
    .combineLatest(entityTypes$, function(candidateData, types){
      const meshName = nameCleanup(candidateData.meta.name)
      return find(propEq('name', meshName))(types)
    })
    .filter(exists)
    .filter(candidate=>candidate.mesh !== undefined)
    //.tap(e=>console.log("addInstancesCandidates",e))
    .map(toArray)
    .take(1)
    .repeat()

  const entityInstancesBase$  = addInstancesCandidates$
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
    .withLatestFrom(entityTypes$, function(instances, types){

      let data =  instances.map(function(instance){
        let instUid = instance.id
        let typeUid = instance.typeUid

        //is this a hack?
        let entry = find(propEq('id', typeUid))(types)
        let mesh = entry.mesh
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

  //annotations
  let addAnnotations$ = addAnnotation(actions.annotationsActions, settings$)
    .map(toArray)

  const proxySelections$ = new Rx.ReplaySubject(1)

  entityActions        = remapEntityActions(entityActions, proxySelections$)

  let metaActions      = remapMetaActions(entityActions     , componentBase$, proxySelections$, addAnnotations$)
  let meshActions      = remapMeshActions(entityActions     , componentBase$, proxySelections$)
  let transformActions = remapTransformActions(entityActions, componentBase$, proxySelections$)
  let boundActions     = remapBoundsActions(entityActions   , componentBase$, proxySelections$)

  let {meta$}          = makeMetaSystem(metaActions)
  let {meshes$}        = makeMeshSystem(meshActions)
  let {transforms$}    = makeTransformsSystem(transformActions)
  let {bounds$}        = makeBoundingSystem(boundActions)

  //selections => only for real time view
  const typesInstancesRegistry$ = makeRegistry(meta$, entityTypes$)
  const selections$             = selections( selectionsIntents({DOM, events}, typesInstancesRegistry$) )
    .merge(metaActions.removeComponents$.map(a=> ({instIds:[],bomIds:[]}) )) //after an instance is removed, unselect

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
  replicateStream(currentSelections$, proxySelections$)

  const bomActions = bomIntents(sources, entityTypes$, metaActions, entityActions, actions)
  const bom$ = bom(bomActions)

  //not entirely sure, we need a way to observe any fetch/updload etc operation
  const operationsInProgress$ = actions.progress.combinedProgress$.startWith(undefined)

  ////
  const design$ = actions.designActions.loadDesign$
    .map(data=>({synched:true, id:data, ns:'ym'}))
    .startWith({synched:false, id:undefined, ns:'ym'})
    .tap(e=>console.log("design",e))

  //////other data
  const appData$ = sources.appMeta

  //authentification data, if any
  const authData$ = authToken(sources.addressbar)
    .flatMap(fromArray)
    .filter(exists)
    .map(token => ({token}))
    .startWith({token:undefined})

  //combine all the above to get our dynamic state
  const state$ = combineLatestObj({
    selections$
    ,bom$
    ,comments$

    ,operationsInProgress$

    //entity components
    ,meta$
    ,transforms$
    ,meshes$
    ,types$:entityTypes$

    //app level data, meta data , settings etc
    ,appData$
    ,settings$

    //infos about current design
    ,design$

    //authData
    ,authData$
  }).shareReplay(1)


  return state$
}
