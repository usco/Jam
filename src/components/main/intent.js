import Rx from 'rx'
const {merge,fromArray,of} = Rx.Observable

import {equals, cond, T, always, head, flatten} from 'ramda'

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

import {intentsFromEvents} from '../../core/actions/fromEvents'
import {intentsFromPostMessage} from '../../core/actions/fromPostMessage'
import {intentsFromResources,makeEntityActionsFromResources} from '../../core/actions/fromResources'
import {makeEntityActionsFromDom} from '../../core/actions/fromDom'

import {filterExtension, normalizeData} from '../../core/sources/utils'


export default function intent (drivers) {
  //data sources for our main model
  const dataSources = drivers

  /*utility function to dynamically load and use the "data extractors" (ie functions that
   extract useful data from raw data)
  */
  function extractDataFromRawSources(sources){

    const data = Object.keys(sources).map(function(sourceName){
      try{
        const extractorImport = require('../../core/sources/'+sourceName)
        
        const sourceData     = sources[sourceName]//the raw source of data (ususually a driver)
        const extractorNames = Object.keys(extractorImport)



        //TODO , find a better way to do this
        const paramsHelper = {
          get:function get(category, params){
            const data = {
              'extensions':{
                 meshes : ["stl","3mf","amf","obj","ctm","ply"]
                ,sources: ["scad","jscad"]
              }
            }
            return data[category][params]
          }
        }
        
        //deal with all the different data "field" functions that are provided by the imports
        const refinedData =  extractorNames.map(function(name){
          const fn = extractorImport[name]
          if(fn){
            const refinedData = fn(sourceData, paramsHelper)
              .flatMap(fromArray)
              .filter(exists)
              return refinedData
          }
        })

        return refinedData
       
      }catch(error){}
    })
    .filter(data=>data!==undefined)

    return merge( flatten( data ) )
  }

  const refinedSourceData$ = normalizeData( extractDataFromRawSources( dataSources ) )


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
  const entityActionsFromDom         = makeEntityActionsFromDom(drivers.DOM)
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
  let requests = assetRequests( refinedSourceData$ )

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