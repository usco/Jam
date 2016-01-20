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

import {resources} from '../../utils/assetManager'
import {requests} from '../../utils/assetRequests'


function intentsFromPostMessage(drivers){
  const postMessage$ = drivers.postMessage
    .filter(exists)

  const postMessageWithData$ = postMessage$
    .filter(p=>p.hasOwnProperty("data"))

  const captureScreen$ = postMessageWithData$ 
    .filter(p=>p.data.hasOwnProperty("captureScreen"))
    .withLatestFrom(drivers.DOM.select(".glView .container canvas").observable,function(request,element){
      element = element[0]
      return {request,element}
    })

  //this one might need refactoring
  const getTransforms$ = postMessageWithData$ 
    .filter(p=>p.data.hasOwnProperty("getTransforms"))

  const getStatus$ = postMessageWithData$ 
    .filter(p=>p.data.hasOwnProperty("getStatus"))

  const clear$ = postMessageWithData$ 
    .filter(p=>p.data.hasOwnProperty("clear"))

  return {
    captureScreen$
    ,getTransforms$
    ,getStatus$
    ,clear$
  }
}

function intentsFromEvents(drivers){
  const events = drivers.events

  //entities/components
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
  //bom
  const updateBomEntries$ = events
    .select("bom").events("editEntry$").map(toArray)

  //measurements & annotations
  const shortSingleTaps$ = events
    .select("gl").events("shortSingleTaps$")

  const createAnnotationStep$ = shortSingleTaps$
    .map( (event)=>event.detail.pickingInfos)
    .filter( (pickingInfos)=>pickingInfos.length>0)
    .map(first)
    .share()  

  return {
    updateComponent$
    ,createAnnotationStep$
    ,updateBomEntries$
  }
}

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
  const postMessages$  = postMessage.pluck("data")

  const meshSources$ = extractMeshSources({dnd$, postMessages$, addressbar})
  const srcSources$  = extractSourceSources({dnd$, postMessages$, addressbar})

  //settings
  const settingsSources$ = localStorage.get("jam!-settings")
  const settingActions   = settingsIntent(drivers)

  //comments
  const commentActions   = commentsIntents(drivers)

  //const selectionActions = selectionsIntents({DOM,events}, typesInstancesRegistry$)
  const postMessageActions  = intentsFromPostMessage(drivers)
  const eventsActions       = intentsFromEvents(drivers)

  let _resources = resources(drivers)
  let progress = _resources

 
  ///entity actions
  const addInstanceCandidates$    = _resources.parsed$//these MIGHT become instances, or something else, we just are not 100% sure
  const reset$                    = DOM.select('.reset').events("click")
  const removeEntityType$         = undefined //same as delete type/ remove bom entry
  const deleteInstances$          = DOM.select('.delete').events("click")
  const duplicateInstances$       = DOM.select('.duplicate').events("click")
  const entityTypeActions         = {registerTypeFromMesh$:addInstanceCandidates$ }

  /*possible sources of instances
    directly:
    - addressBar
    - postMessage
    - drag & drop
    Indirectly:
      - duplicates of other instances
  */
  const entityActions = {
    addInstanceCandidates$
    ,updateComponent$:eventsActions.updateComponent$
    ,duplicateInstances$
    ,deleteInstances$
    ,reset$
  }

  const annotationsActions =  {
    creationStep$: eventsActions.createAnnotationStep$
  }

  //const bomActions = bomIntent(drivers)
  const bomActions = {
    updateBomEntries$:eventsActions.updateBomEntries$
  }  

  //experimental , new asset manager
  //OUTbound
  let _requests = requests({meshSources$,srcSources$})
  let requests$ = _requests.requests.http$
  let desktop$  = _requests.requests.desktop$

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

    ,apiActions:postMessageActions

    ,progress

    ,requests$
    ,desktop$

  }
}