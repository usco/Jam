import { mergeActionsByName } from '../../utils/obsUtils'

import actionsFromDOM from './actions/fromDOM'
import actionsFromEvents from './actions/fromEvents'
import actionsFromPostMessage from './actions/fromPostMessage'
import actionsFromYm from './actions/fromYm'
import actionsFromResources from './actions/fromResources'

export default function intents (sources) {
  console.log('here', sources)
  const actionsSources = [
    actionsFromDOM(sources.DOM),
    actionsFromEvents(sources.events),
    actionsFromPostMessage(sources.postMessage),

    // special cases
    actionsFromResources(sources.resources.parsed$),
    actionsFromYm({ ym: sources.ym, resources: sources.resources.parsed$ }) // special signature
  ]

  return mergeActionsByName(actionsSources)
}

/* const entityActionNames = [
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
const entityActions  = mergeActionsByName(actionsSources, entityActionNames)*/
