import Rx from 'rx'
const merge = Rx.Observable.merge

import {first,toggleCursor} from '../../utils/otherUtils'
import {exists,toArray} from '../../utils/utils'

import {observableDragAndDrop} from '../../interactions/dragAndDrop'

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


import {requests,resources} from '../../utils/assetManager'

export default function intent (drivers) {
  const DOM      = drivers.DOM
  const localStorage = drivers.localStorage
  const addressbar   = drivers.addressbar
  const postMessage  = drivers.postMessage
  const events       = drivers.events

  const dragOvers$  = DOM.select(':root').events("dragover")
  const drops$      = DOM.select(':root').events("drop")  
  const dnd$        = observableDragAndDrop(dragOvers$, drops$) 

  //data sources for our main model
  let postMessages$  = postMessage.pluck("data")
  const meshSources$ = extractMeshSources({dnd$, postMessages$, addressbar})
  const srcSources$  = extractSourceSources({dnd$, postMessages$, addressbar})

  //settings
  const settingsSources$ = localStorage.get("jam!-settings")
  const settingActions   = settingsIntent(drivers)
  //comments
  const commentActions   = commentsIntents(drivers)


  function apiIntents(drivers){
    const postMessage = drivers.postMessage
      .filter(exists)

    const captureScreen$ = postMessage 
      .filter(p=>p.hasOwnProperty("data"))
      .filter(p=>p.data.hasOwnProperty("captureScreen"))
      .withLatestFrom(drivers.DOM.select(".glView .container canvas").observable,function(request,element){
        element = element[0]
        return {request,element}
      })

    //this one might need refactoring
    const getTransforms$ = postMessage
      .filter(p=>p.hasOwnProperty("data"))
      .filter(p=>p.data.hasOwnProperty("getTransforms"))

    const getStatus$ = postMessage
      .filter(p=>p.hasOwnProperty("data"))
      .filter(p=>p.data.hasOwnProperty("getStatus"))

    return {
      captureScreen$
      ,getTransforms$
      ,getStatus$
    }
  }
  
  //const selectionActions = selectionsIntents({DOM,events}, typesInstancesRegistry$)

  const apiActions  = apiIntents(drivers)

  //experimental , new asset manager
  //OUTbound
  let _requests = requests({meshSources$,srcSources$})
  let requests$ = _requests.requests.http$
  let desktop$  = _requests.requests.desktop$

  
  let progress = resources(drivers)

  const entityTypeIntents2 = {
    registerTypeFromMesh$:progress.parsed$
  }

  ///entity actions
  const entityTypeActions         = entityTypeIntents2//entityTypeIntents({meshSources$,srcSources$})
  const reset$                    = DOM.select('.reset').events("click")
  const removeEntityType$         = undefined //same as delete type/ remove bom entry
  const deleteEntityInstances$    = DOM.select('.delete').events("click")
  const duplicateEntityInstances$ = DOM.select('.duplicate').events("click")


  const addEntityInstanceCandidates$ =  progress.parsed$//these MIGHT become instances, we just are not 100% sure
  /*possible sources of instances
    directly:
    - addressBar
    - postMessage
    - drag & drop
    Indirectly:
      - duplicates of other instances
      - design

  */

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

  createAnnotationStep$.forEach(e=>console.log("createAnnotationStep",e))

  const annotationsActions =  {
    creationStep$: createAnnotationStep$
  }


  //const bomActions = bomIntent(drivers)
  const bomActions = {
    updateBomEntries$:events.select("bom").events("editEntry$").map(toArray)
  }  
  /*let foo$ = Rx.Observable.just("bar")
  let reset2$ = DOM.select('.reset').events("click")
  DOM.select('.reset').events("click").forEach(e=>console.log("reseting bom1"))
  DOM.select('.reset').events("click").forEach(e=>console.log("reseting bom2"))

  reset2$.withLatestFrom(foo$,function(e,f){
    console.log("reset")
  }).forEach(e=>e)*/


 

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

    ,apiActions

    ,progress

    ,requests$
    ,desktop$

  }
}