import Rx from 'rx'
const {merge,fromArray,of} = Rx.Observable

import {equals, cond, T, always, head, flatten} from 'ramda'
import path from 'path'

import {first,toggleCursor} from '../../utils/otherUtils'
import {exists,toArray} from '../../utils/utils'
import {getExtension,getNameAndExtension,isValidFile} from '../../utils/utils'
import {combineLatestObj, mergeActionsByName} from '../../utils/obsUtils'
import {mergeData} from '../../utils/modelUtils'


import {settingsIntent} from    './intents/settings'
import {commentsIntents} from   './intents/comments'
import {selectionsIntents} from './intents/selections'
import {bomIntent} from         './intents/bom'

import {resources} from '../../utils/assetManager'
import assetRequests from '../../utils/assetRequests'

//
import {intentsFromEvents} from '../../core/actions/fromEvents'
import {intentsFromPostMessage} from '../../core/actions/fromPostMessage'
import {intentsFromResources,makeEntityActionsFromResources} from '../../core/actions/fromResources'
import {makeEntityActionsFromDom} from '../../core/actions/fromDom'
import {makeEntityActionsFromYm} from '../../core/actions/fromYm'

import {filterExtension, normalizeData, extractDataFromRawSources} from '../../core/sources/utils'

import {designSource} from '../../core/sources/addressbar.js'

export default function intent (sources) {
  //data sources for our main model
  const dataSources = sources

  //FIXME: damned  relative paths ! actual path (relative to THIS module) is '../../core/sources/' , relative to the loader it is '.'
  const refinedSourceData$ = normalizeData( extractDataFromRawSources( dataSources, '.' ) )//q.tap(e=>console.log("foo",e))
    .tap(e=>console.log("refinedSourceData$",e))

  //const actions            = actionsFromSources(sources, path.resolve(__dirname,'./actions')+'/' )

  //this one is specific to design sources/ids
  const loadDesign$ = designSource(sources.addressbar)
    .flatMap(fromArray)

  //settings
  const settingActions   = settingsIntent(sources)
  //comments
  const commentActions   = commentsIntents(sources)

  let _resources = resources(sources)

  //actions from various sources
  const actionsFromPostMessage = intentsFromPostMessage(sources)
  const actionsFromEvents      = intentsFromEvents(sources)
  const {entityCandidates$, entityCertains$}= intentsFromResources(_resources.parsed$)//these MIGHT become instances, or something else, we just are not 100% sure

  const entityActionsFromResources   = makeEntityActionsFromResources(entityCertains$)
  const entityActionsFromDom         = makeEntityActionsFromDom(sources.DOM)
  const entityActionsFromYm          = makeEntityActionsFromYm(sources.ym)

  const extras = {entityCandidates$}


 const addEntityTypesFromPostMessage$ = actionsFromPostMessage.addPartData$
   .map(function(data){
     return data.map(function(entry) {
       const data = {id:entry.uuid, file:entry.file}
       return data
     })
   })
   .forEach(e=>console.log("addEntityTypesFromPostMessage",e))


   const entityActionNames = [
    'reset'

    ,'addEntityTypes'
    ,'removeEntityType'
    ,'entityCandidates'

    ,'deleteInstances'
    ,'duplicateInstances'

    ,'updateComponent'
    ,'createMetaComponents'
    ,'createTransformComponents'
    ,'createMeshComponents'
  ]

  const actionsSources = [
    entityActionsFromDom, actionsFromPostMessage,
    entityActionsFromResources, actionsFromEvents,
    entityActionsFromYm, extras]
  const entityActions  = mergeActionsByName(actionsSources, entityActionNames)
  //console.log("entityActions",entityActions)

  const annotationsActions =  {
    creationStep$: actionsFromEvents.createAnnotationStep$
  }

  const bomActions = {
    updateBomEntries$:actionsFromEvents.updateBomEntries$
  }

   //const designActions  =mergeActionsByName([actionsFromPostMessage], entityActionNames)
  const designActions = {
    loadDesign$:actionsFromPostMessage.loadDesign$.merge(loadDesign$)
  }

  //OUTbound requests to various sources
  let requests = assetRequests( refinedSourceData$ )

  return {
    settingActions

    ,commentActions

    //,selectionActions
    ,entityActions
    ,annotationsActions
    ,bomActions
    ,designActions

    ,apiActions:actionsFromPostMessage

    ,progress:_resources

    ,requests

    //,loadDesign
  }
}
