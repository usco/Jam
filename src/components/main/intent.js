import Rx from 'rx'
const {merge,fromArray,of} = Rx.Observable

import {equals, cond, T, always, head, flatten} from 'ramda'
import path from 'path'

import {first,toggleCursor} from '../../utils/otherUtils'
import {exists,toArray} from '../../utils/utils'
import {getExtension,getNameAndExtension,isValidFile} from '../../utils/utils'
import {combineLatestObj, mergeActionsByName} from '../../utils/obsUtils'
import {mergeData} from '../../utils/modelUtils'

import designIntents from '../../core/design/intents'
import entityIntents from '../../core/entities/intents'
import settingsIntent from    '../../core/settings/intents'
import commentsIntents from   '../../core/comments/intents'


import {selectionsIntents} from './intents/selections'
import {bomIntent} from         './intents/bom'

import {resources} from '../../utils/assetManager'
import assetRequests from '../../utils/assetRequests'

//
import {intentsFromPostMessage} from '../../core/actions/fromPostMessage'

import {filterExtension, normalizeData, extractDataFromRawSources} from '../../core/sources/utils'


export default function intent (sources) {
  //FIXME: damned  relative paths ! actual path (relative to THIS module) is '../../core/sources/' , relative to the loader it is '.'
  const refinedSourceData$ = normalizeData( extractDataFromRawSources( sources, '.' ) )//q.tap(e=>console.log("foo",e))
    //.tap(e=>console.log("refinedSourceData$",e))

  //const actions            = actionsFromSources(sources, path.resolve(__dirname,'./actions')+'/' )
  let _resources = resources(sources)
  //we also require resources as a source
  sources = mergeData(sources, {resources:_resources})

  //design
  const designActions   = designIntents(sources)
  //entities
  const entityActions   = entityIntents(sources)
  //settings
  const settingActions   = settingsIntent(sources)
  //comments
  const commentActions   = commentsIntents(sources)


  //actions from various sources
  const actionsFromPostMessage = intentsFromPostMessage(sources)

   //we create special "read an html5 file " requests with added id
   const desktopRequests$ = Rx.Observable.never() /*actionsFromPostMessage.addPartData$
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
    .flatMap(fromArray)*/


  //console.log("entityActions",entityActions)

  //OUTbound requests to various sources
  let requests = assetRequests( refinedSourceData$ )
    requests.desktop$ = requests.desktop$
      //.merge(desktopRequests$)
    requests.http$ = requests.http$
      //.merge(entityActionsFromYm.requests$)

  return {
    settingActions

    //,selectionActions
    ,designActions
    ,entityActions
    ,commentActions
    ,annotationsActions:{creationStep$:Rx.Observable.never()}

    ,apiActions:actionsFromPostMessage

    ,progress:_resources

    ,requests
  }
}
