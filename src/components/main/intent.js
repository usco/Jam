import Rx from 'rx'
import {has} from 'ramda'

import { mergeData } from '../../utils/modelUtils'
import { preventBackNavigation } from '../../interactions/keyboard'

import apiIntents from '../../core/api/intents'
import designIntents from '../../core/design/intents'
import authIntents from '../../core/auth/intents'
import entityIntents from '../../core/entities/intents'
import settingsIntent from '../../core/settings/intents'
import commentsIntents from '../../core/comments/intents'

import { resources } from '../../utils/assetManager'
import assetRequests from '../../utils/assetRequests'

import { normalizeData, extractDataFromRawSources } from '../../core/sources/utils'

export default function intent (sources) {
  // disable backspace navigation for MacOs
  preventBackNavigation()

  // FIXME: damned  relative paths ! actual path (relative to THIS module) is '../../core/sources/' , relative to the loader it is '.'
  const refinedSourceData$ = normalizeData(extractDataFromRawSources(sources, '.')) // q.tap(e=>console.log("foo",e))
  // .tap(e=>console.log("refinedSourceData$",e))

  // const actions            = actionsFromSources(sources, path.resolve(__dirname,'./actions')+'/' )
  let _resources = resources(sources)
  // special case for gcode etc
  let visualResources$ = _resources.parsed$
    .filter(e => e.progress === 1)
    .pluck('data')
    .filter(data => !has('meshOnly',data))

  // we also require resources as a source
  sources = mergeData(sources, {resources: _resources})

  // design
  const designActions = designIntents(sources)
  // entities
  const entityActions = entityIntents(sources)
  // settings
  const settingActions = settingsIntent(sources)
  // auth
  const authActions = authIntents(sources)
  // comments
  const commentActions = commentsIntents(sources)

  // API
  const apiActions = apiIntents(sources)

  // OUTbound requests to various sources
  let requests = assetRequests(refinedSourceData$)
  requests.desktop$ = requests.desktop$
    .merge(entityActions.desktopRequests$)
  requests.http$ = requests.http$
    .merge(entityActions.requests$)

  return {
    settingActions,
    // ,selectionActions
    designActions,
    authActions,
    entityActions,
    commentActions,
    annotationsActions: {creationStep$: Rx.Observable.never()},
    apiActions,
    progress: _resources,
    requests,

    visualResources: visualResources$
  }
}
