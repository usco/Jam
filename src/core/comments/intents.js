import { mergeActionsByName } from '../../utils/obsUtils'

import actionsFromEvents from './actions/fromEvents'

export default function intents (sources) {
  const actionsSources = [
    actionsFromEvents(sources.events)
  ]
  return mergeActionsByName(actionsSources)
}
