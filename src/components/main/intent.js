import Rx from 'rx'
const merge = Rx.Observable.merge

import {first,toggleCursor} from '../../utils/otherUtils'
import {exists,toArray} from '../../utils/utils'

import {observableDragAndDrop} from '../../interactions/dragAndDrop'

import {entityTypeIntents, entityInstanceIntents} from '../../core/entities/intentHelpers'
import {extractDesignSources,extractMeshSources,extractSourceSources} from '../../core/dataSourceExtractors'

import {settingsIntent} from    './intents/settings'
import {commentsIntents} from   './intents/comments'
import {selectionsIntents} from './intents/selections'
import {bomIntent} from         './intents/bom'


const of = Rx.Observable.of
import {equals, cond, T, always} from 'ramda'
import {getExtension,getNameAndExtension,isValidFile} from '../../utils/utils'
import {combineLatestObj} from '../../utils/obsUtils'
import {mergeData} from '../../utils/modelUtils'
import StlParser    from 'usco-stl-parser'

import postProcessMesh from '../../utils/meshUtils'
import helpers         from 'glView-helpers'
const centerMesh         = helpers.mesthTools.centerMesh


export default function intent (drivers) {
  const DOM      = drivers.DOM
  const localStorage = drivers.localStorage
  const addressbar   = drivers.addressbar
  const postMessage  = drivers.postMessage
  const events       = drivers.events

  const dragOvers$  = DOM.select("#root").events("dragover")
  const drops$      = DOM.select("#root").events("drop")  
  const dnd$        = observableDragAndDrop(dragOvers$, drops$) 

  //data sources for our main model
  let postMessages$  = postMessage
  const meshSources$ = extractMeshSources({dnd$, postMessages$, addressbar})
  const srcSources$  = extractSourceSources({dnd$, postMessages$, addressbar})

  //settings
  const settingsSources$ = localStorage.get("jam!-settings")
  const settingActions   = settingsIntent(drivers)
  //comments
  const commentActions   = commentsIntents(drivers)
  
  //const selectionActions = selectionsIntents({DOM,events}, typesInstancesRegistry$)

  //experimental test to work around asset manager
  function http({meshSources$,srcSources$})
  {
    return merge(
        meshSources$
        ,srcSources$
      )
      .flatMap(Rx.Observable.fromArray)
      .filter(e=>!isValidFile(e))
      .map(
        s=>({
          uri: s
          , url: s
          , method: 'get'
          , responseType: 'json'
          , type: 'resource'
        }))
  }
  //request from desktop store (source only)
  function desktop({meshSources$,srcSources$}){
    return merge(
        meshSources$
        ,srcSources$
      )
      .flatMap(Rx.Observable.fromArray)
      .filter(isValidFile)
      .map(
        s=>({
          uri: s.name
          , data:s
          , method: 'get'
          , type: 'resource'
        }))
      .do(e=>console.log("desktop store request"))
  }

  //FIXME: caching should be done at a higher level , to prevent useless requests
  const resourceCache$ = undefined
  const cache = {}
  function getCached({meshSources$,srcSources$}){

  }

  //OUTbound
  let requests$ = http({meshSources$,srcSources$})
  let desktop$  = desktop({meshSources$,srcSources$})

  function postProcessParsedData(data){
    let mesh = data 
    mesh = postProcessMesh(mesh)
    mesh = centerMesh(mesh)
    return mesh
  }

/*
       => p =>
  =====       ======>
       => p =>
*/
  
  function resources(drivers){
    
    const resources$$ = merge(
         drivers.http
        ,drivers.desktop
      )
      .filter(res$ => res$.request.type === 'resource')
      .retry(3)
      .catch(function(e){
        console.log("ouch , problem fetching data ",e)
        return Rx.Observable.empty()
      })
      .flatMap(function(e){
        const request  = of( e.request )
        const response = e.pluck("response")
        const progress = e.pluck("progress")
        return combineLatestObj({response,request,progress})
      })
      .share()

    //combined data
    const combinedProgress$ = resources$$.scan(function(combined,entry){
      const uri = entry.request.uri
      if(entry.progress || entry.response){
        combined.entries[uri]  = entry.progress || 1

        let totalProgress = Object.keys(combined.entries)
          .reduce(function(acc,cur){
            return acc + combined.entries[cur]
          },0)

        totalProgress /= Object.keys(combined.entries).length
        combined.totalProgress = totalProgress
      }

      return combined
    },{entries:{}})
    .pluck("totalProgress")
    .distinctUntilChanged(null, equals)
    .debounce(10)


    //other
    let parsers = {}
      parsers["stl"] = new StlParser()

    /*resources$$
      .filter(data=>(data.response!==undefined && data.progress === undefined))
      .forEach(e=>console.log("resources",e))*/

    const parseBase$ = resources$$
      .filter(data=>(data.response !== undefined && data.progress === undefined))
      .distinctUntilChanged(d=>d.request.uri,equals)
      .debounce(10)
      .shareReplay(1)

    const parsed$ = parseBase$
      //.do(e=>console.log("parsedA",e))
      .map(function(data){
        const uri = data.request.uri
        const {name,ext} = getNameAndExtension(uri)
        return {uri, data:data.response, ext, name}
      })
      //actual parsing part
      .filter(data=>parsers[data.ext]!==undefined)//does parser exist?
      .flatMap(function({uri, data, ext, name}){
        const parseOptions={useWorker:true,useBuffers:true}

        const deferred = parsers[ext].parse(data, parseOptions)

        const data$  = Rx.Observable.fromPromise(deferred.promise)
          .map(postProcessParsedData) 
        const meta$    = of({uri, ext, name})

        console.log("basics ready")
        return combineLatestObj({meta$,data$})
      })
      .do(e=>console.log("parsed data ready",e))
    
    parsed$
      .forEach(e=>console.log("parsed",e))

    return {
      combinedProgress$
      , parsed$
    }
  }

  let progress = resources(drivers)

  let   registerTypeFromMesh$ = progress.parsed$
  const entityTypeIntents2 = {
    registerTypeFromMesh$
  }


  /*const fn = cond([
    [equals(0),   always('water freezes at 0°C')],
    [equals(100), always('water boils at 100°C')],
    [T,           temp => 'nothing special happens at ' + temp + '°C']
  ])

  console.log( fn(0) ) //=> 'water freezes at 0°C'
  console.log( fn(50) ) //=> 'nothing special happens at 50°C'
  console.log( fn(100) ) //=> 'water boils at 100°C'*/


  ///entity actions
  const entityTypeActions         = entityTypeIntents2//entityTypeIntents({meshSources$,srcSources$})
  const reset$                    = DOM.select('.reset').events("click")
  const removeEntityType$         = undefined //same as delete type/ remove bom entry
  const deleteEntityInstances$    = DOM.select('.delete').events("click")
  const duplicateEntityInstances$ = DOM.select('.duplicate').events("click")

  const addEntityInstanceCandidates$ =  entityTypeActions //these MIGHT become instances, we just are not 100% sure
    .registerTypeFromMesh$

  const updateCoreComponent$ = events
    .select("entityInfos")
    .events("changeCore$")
    .map(c=>( {target:"core",data:c}))

  const updateTransformComponent$ = events
    .select("entityInfos")
    .events("changeTransforms$")
    .merge(
      events
        .select("gl")
        .events("selectionsTransforms$")
        .debounce(20)
    )
    .map(c=>( {target:"transforms",data:c}))

  const updateComponent$ = merge(
    updateCoreComponent$
    ,updateTransformComponent$
    )

  const entityActions = {
    addEntityInstanceCandidates$
    ,updateComponent$
    ,duplicateEntityInstances$
    ,deleteEntityInstances$
    ,reset$
  }


  //measurements
  const shortSingleTaps$ = events.select("gl").events("shortSingleTaps$")

  const createAnnotationStep$ = shortSingleTaps$
    .map( (event)=>event.detail.pickingInfos)
    .filter( (pickingInfos)=>pickingInfos.length>0)
    .map(first)
    .share()  

  createAnnotationStep$.subscribe(e=>console.log("createAnnotationStep",e))

  const annotationsActions =  {
    creationStep$: createAnnotationStep$
  }


  //const bomActions = bomIntent(drivers)
  const bomActions = {
    updateBomEntries$:events.select("bom").events("editEntry$").map(toArray)
  }  
  /*let foo$ = Rx.Observable.just("bar")
  let reset2$ = DOM.select('.reset').events("click")
  DOM.select('.reset').events("click").subscribe(e=>console.log("reseting bom1"))
  DOM.select('.reset').events("click").subscribe(e=>console.log("reseting bom2"))

  reset2$.withLatestFrom(foo$,function(e,f){
    console.log("reset")
  }).subscribe(e=>e)*/

  return {
    dnd$
     
    ,settingsSources$
    ,settingActions

    ,commentActions

    //,selectionActions
    ,entityActions
    ,entityTypeActions
    ,annotationsActions

    ,bomActions


    ,progress

    ,requests$
    ,desktop$

  }
}