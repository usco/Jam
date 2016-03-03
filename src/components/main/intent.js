import Rx from 'rx'
const {merge,fromArray,of} = Rx.Observable

import {equals, cond, T, always, head, flatten} from 'ramda'
import path from 'path'

import {first,toggleCursor} from '../../utils/otherUtils'
import {exists,toArray} from '../../utils/utils'
import {getExtension,getNameAndExtension,isValidFile} from '../../utils/utils'
import {combineLatestObj, mergeActionsByName} from '../../utils/obsUtils'
import {mergeData} from '../../utils/modelUtils'

import {nameCleanup} from '../../utils/formatters'


import settingsIntent from    '../../core/settings/intents'

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

import assign from 'fast.js/object/assign'//faster object.assign


export default function intent (sources) {
  //data sources for our main model
  const dataSources = sources

  //FIXME: damned  relative paths ! actual path (relative to THIS module) is '../../core/sources/' , relative to the loader it is '.'
  const refinedSourceData$ = normalizeData( extractDataFromRawSources( dataSources, '.' ) )//q.tap(e=>console.log("foo",e))
    //.tap(e=>console.log("refinedSourceData$",e))

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


  const alreadyExistingTypeMeshData$ = _resources.parsed$
    .filter(data=>data.meta.id !== undefined)
    //.forEach(e=>console.log("alreadyExistingTypeMeshData",e))

  //create new part type from basic type data & mesh data
  const addTypeFromTypeAndMeshData$ = alreadyExistingTypeMeshData$
    .map(function(entry){
      const data = entry.data.typesMeshes[0].mesh
      const meta = {
        name:nameCleanup( entry.meta.name )
        ,id:entry.meta.id
      }
       return {id:entry.meta.id, data, meta}
     })
     //.tap(e=>console.log("addEntityTypesFromPostMessage",e))


   //we create special "read an html5 file " requests with added id
   const desktopRequests$ = actionsFromPostMessage.addPartData$
    .map(function(data){
      return data.map(function(entry) {
        return {
          id:entry.uuid
          ,uri:entry.file.name//name of the html5 File object
          ,method:'get'
          ,data:entry.file
          //url:req.uri
          ,src:'desktop'
          ,type:'resource'}
      })
    })
    .flatMap(fromArray)

  const removeTypes$ = actionsFromPostMessage.removePartData$
    .map(function(data){
      return data.map(entry=>({id:entry.uuid}))
    })

  const deleteInstances$ = actionsFromPostMessage.removePartData$
    .map(function(data){
      return data.map(entry=>({typeUid:entry.uuid}))
    })
    .tap(e=>console.log("deleteInstances",e))

   const extras = {
     addInstanceCandidates$:entityCandidates$
     ,addTypeCandidate$:entityCandidates$.filter(data=>data.meta.id === undefined)
     ,addTypes$:addTypeFromTypeAndMeshData$
     ,removeTypes$:removeTypes$
     ,deleteInstances$
   }

   const entityActionNames = [
    'reset'

    ,'addTypes'
    ,'addTypeCandidate'
    ,'removeTypes'

    ,'addInstanceCandidates'
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

   //const designActions  =mergeActionsByName([actionsFromPostMessage], entityActionNames)
  const designActions = {
    loadDesign$:actionsFromPostMessage.loadDesign$.merge(loadDesign$)
  }

  //OUTbound requests to various sources
  let requests = assetRequests( refinedSourceData$ )
    requests.desktop$ = requests.desktop$
      .merge(desktopRequests$)
    requests.http$ = requests.http$
      .merge(entityActionsFromYm.requests$)

  return {
    settingActions

    ,commentActions

    //,selectionActions
    ,entityActions
    ,annotationsActions
    ,designActions

    ,apiActions:actionsFromPostMessage

    ,progress:_resources

    ,requests
  }
}
