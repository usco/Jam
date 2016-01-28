import Rx from 'rx'
const merge = Rx.Observable.merge
const fromArray = Rx.Observable.fromArray
const of = Rx.Observable.of
import {equals, cond, T, always, head} from 'ramda'

import {first,toggleCursor} from '../../utils/otherUtils'
import {exists,toArray} from '../../utils/utils'
import {getExtension,getNameAndExtension,isValidFile} from '../../utils/utils'
import {combineLatestObj} from '../../utils/obsUtils'
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
import {intentsFromResources} from '../../core/actions/fromResources'


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

  let _resources = resources(drivers)

  //actions from various sources
  const actionsFromPostMessage = intentsFromPostMessage(drivers)
  const actionsFromEvents      = intentsFromEvents(drivers)
  const actionsFromResources   = intentsFromResources(_resources.parsed$)

  ///entity actions
  const addInstanceCandidates$    = actionsFromResources.candidates$ //_resources.parsed$//these MIGHT become instances, or something else, we just are not 100% sure
  const reset$                    = DOM.select('.reset').events("click")
  const removeEntityType$         = undefined //same as delete type/ remove bom entry
  const deleteInstances$          = DOM.select('.delete').events("click")
  const duplicateInstances$       = DOM.select('.duplicate').events("click")


  const entityTypeActions         = {
      createEntityTypes$:actionsFromResources.createEntityTypes$
    , registerTypeFromMesh$:addInstanceCandidates$ 
  }

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
    , updateComponent$:actionsFromEvents.updateComponent$
    , duplicateInstances$
    , deleteInstances$
    , reset$

    , createCoreComponents$     :  actionsFromResources.createCoreComponents$
    , createTransformComponents$: actionsFromResources.createTransformComponents$
    , createMeshComponents$     : actionsFromResources.createMeshComponents$
  }

  const annotationsActions =  {
    creationStep$: actionsFromEvents.createAnnotationStep$
  }

  //const bomActions = bomIntent(drivers)
  const bomActions = {
    updateBomEntries$:actionsFromEvents.updateBomEntries$
  }  

  //OUTbound requests to various drivers
  let requests = assetRequests({meshSources$,srcSources$})
  let requests$ = requests.requests.http$
  let desktop$  = requests.requests.desktop$

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

    ,apiActions:actionsFromPostMessage

    ,progress:_resources

    ,requests$
    ,desktop$

  }
}