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


import {equals, cond, T, always} from 'ramda'
import {getExtension,getNameAndExtension,isValidFile} from '../../utils/utils'
import {combineLatestObj} from '../../utils/obsUtils'
import {mergeData} from '../../utils/modelUtils'
import StlParser    from 'usco-stl-parser'


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
    return meshSources$
      .merge(srcSources$)
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
    return meshSources$
      .merge(srcSources$)
      .flatMap(Rx.Observable.fromArray)
      .filter(isValidFile)
      .map(
        s=>({
          uri: s.name
          , data:s
          , method: 'get'
          , type: 'resource'
        }))
  }
  let requests$ = http({meshSources$,srcSources$})
  let desktop$  = desktop({meshSources$,srcSources$})


  
  
  function bla(drivers){
    let resources$$ = drivers.http
      .merge(drivers.desktop)
      .filter(res$ => res$.request.type === 'resource')
      .retry(3)
      .catch(function(e){
        console.log("ouch , problem fetching data ",e)
        return Rx.Observable.empty()
      })
      .flatMap(function(e){
        const request  = Rx.Observable.just( e.request )
        const response = e.pluck("response")
        const progress = e.pluck("progress")
        return combineLatestObj({response,request,progress})
      })
      .share()

    //combined data
    const combinedProgress$ = resources$$.scan(function(combined,entry){
      //console.log("acc",acc,"curURL",cur.request.url,cur.request.uri.name)
      const uri = entry.request.uri
      if(entry.progress){
        combined.entries[uri]  = entry.progress

        let totalProgress = Object.keys(combined.entries)
          .reduce(function(acc,cur){
            return acc + combined.entries[cur]
          },0)

        totalProgress /= Object.keys(combined.entries).length
        //console.log("totalProgress", totalProgress)
        combined.totalProgress = totalProgress
      }

      if(entry.response){
        combined.entries[uri]  = 1

        let totalProgress = Object.keys(combined.entries)
          .reduce(function(acc,cur){
            return acc + combined.entries[cur]
          },0)

        totalProgress /= Object.keys(combined.entries).length
        //console.log("totalProgress", totalProgress)
        combined.totalProgress = totalProgress
      }
      return combined
    },{entries:{}})
    .pluck("totalProgress")
    .distinctUntilChanged(null, equals)
    .debounce(10)

    combinedProgress$.subscribe(e=>console.log("combinedProgress",e))
    //other
    let parsers = {}
      parsers["stl"] = new StlParser()


    /*resources$$
      .filter(data=>(data.response!==undefined && data.progress === undefined))
      .forEach(e=>console.log("resources",e))*/

    const parsed$ = resources$$
      .filter(data=>(data.response!==undefined && data.progress === undefined))
      .map(function(data){
        const uri = data.request.uri
        const {name,ext} = getNameAndExtension(uri)
        return {uri, data:data.response, ext, name}
      })
      //actual parsing part
      .filter(data=>parsers[data.ext]!==undefined)//does parser exist?
      .flatMap(function({uri, data, ext, name}){
        const parseOptions={}

        const deferred = parsers[ext].parse(data, parseOptions)
        const data$  = Rx.Observable.fromPromise(deferred.promise)
        const meta$    = Rx.Observable.just({uri, ext, name})
        return combineLatestObj({meta$,data$})
      })
    
    parsed$
      .forEach(e=>console.log("parsed",e))

    return {
      combinedProgress$
      , parsed$
    }
  }

  let progress = bla(drivers)



  const fn = cond([
    [equals(0),   always('water freezes at 0°C')],
    [equals(100), always('water boils at 100°C')],
    [T,           temp => 'nothing special happens at ' + temp + '°C']
  ])

  console.log( fn(0) ) //=> 'water freezes at 0°C'
  console.log( fn(50) ) //=> 'nothing special happens at 50°C'
  console.log( fn(100) ) //=> 'water boils at 100°C'


  ///entity actions
  const entityTypeActions        = entityTypeIntents({meshSources$,srcSources$})
  const reset$                   = DOM.select('.reset').events("click")
  const removeEntityType$        = undefined //same as delete type/ remove bom entry
  const deleteEntityInstances$    = DOM.select('.delete').events("click")
  const duplicateEntityInstances$ = DOM.select('.duplicate').events("click")

  const addEntityInstanceCandidates$ =  entityTypeActions //these MIGHT become instances, not 100% sure
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


  //annotations
  const shortSingleTaps$ = events.select("gl").events("shortSingleTaps$")
    //shortSingleTaps$.subscribe(e=>console.log("shortSingleTaps",e))

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