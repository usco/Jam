import {mergeActionsByName} from '../../utils/obsUtils'
import actionsFromEvents from './actions/fromEvents'

export default function intents(sources, params){
  const actionsSources = [
    actionsFromEvents(sources.events, params)
  ]

  return mergeActionsByName(actionsSources)
}
