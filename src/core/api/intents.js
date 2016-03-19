import {mergeActionsByName} from '../../utils/obsUtils'
import actionsFromPostMessage from './actions/fromPostMessage'

export default function intents(sources){
  const actionsSources = [
    actionsFromPostMessage(sources.postMessage)
  ]
  return mergeActionsByName(actionsSources)
}
