import Rx from 'rx'
const merge = Rx.Observable.merge
const fromArray = Rx.Observable.fromArray
const of = Rx.Observable.of
import {equals, cond, T, always, head} from 'ramda'

import {first,toggleCursor} from '../../utils/otherUtils'
import {exists,toArray} from '../../utils/utils'
import {getExtension,getNameAndExtension,isValidFile} from '../../utils/utils'
import {combineLatestObj, mergeActionsByName} from '../../utils/obsUtils'
import {mergeData} from '../../utils/modelUtils'

//
import {observableDragAndDrop} from '../../interactions/dragAndDrop'

import {extractDesignSources,extractMeshSources,extractSourceSources} from '../../core/dataSourceExtractors'

import {settingsIntent} from    './intents/settings'
import {commentsIntents} from   './intents/comments'
import {selectionsIntents} from './intents/selections'
import {bomIntent} from         './intents/bom'

import {resources} from '../../utils/assetManager'
import assetRequests from '../../utils/assetRequests'

import {intentsFromEvents} from '../../core/actions/fromEvents'
import {intentsFromPostMessage} from '../../core/actions/fromPostMessage'
import {intentsFromResources,makeEntityActionsFromResources} from '../../core/actions/fromResources'
import {makeEntityActionsFromDom} from '../../core/actions/fromDom'


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
  const meshSources$ = extractMeshSources({dnd$, postMessage, addressbar})
  const srcSources$  = extractSourceSources({dnd$, postMessage, addressbar})

  //settings
  const settingActions   = settingsIntent(drivers)

  //comments
  const commentActions   = commentsIntents(drivers)

  let _resources = resources(drivers)

  //actions from various sources
  const actionsFromPostMessage = intentsFromPostMessage(drivers)
  const actionsFromEvents      = intentsFromEvents(drivers)
  const {entityCandidates$, entityCertains$}= intentsFromResources(_resources.parsed$)//these MIGHT become instances, or something else, we just are not 100% sure
  
  const entityActionsFromResources   = makeEntityActionsFromResources(entityCertains$)
  const entityActionsFromDom         = makeEntityActionsFromDom(DOM)
  const extras = {entityCandidates$}

   const entityActionNames = [
    'reset'

    ,'addEntityType'
    ,'removeEntityType'
    ,'entityCandidates'

    ,'deleteInstances'
    ,'duplicateInstances'

    ,'updateComponent'
    ,'createCoreComponents'
    ,'createTransformComponents'
    ,'createMeshComponents'
  ]

  const actionsSources = [entityActionsFromDom, actionsFromPostMessage, entityActionsFromResources, actionsFromEvents, extras]
  const entityActions = mergeActionsByName(actionsSources, entityActionNames)
  //console.log("entityActions",entityActions)

  const annotationsActions =  {
    creationStep$: actionsFromEvents.createAnnotationStep$
  }

  const bomActions = {
    updateBomEntries$:actionsFromEvents.updateBomEntries$
  }  

  //OUTbound requests to various drivers
  let requests = assetRequests({meshSources$,srcSources$})

  return {     
    settingActions

    ,commentActions

    //,selectionActions
    ,entityActions
    ,annotationsActions
    ,bomActions

    ,apiActions:actionsFromPostMessage

    ,progress:_resources

    ,requests
  }
}