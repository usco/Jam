import { mergeActionsByName } from '../../utils/obsUtils'

import actionsFromDOM from './actions/fromDOM'
import actionsFromAddressbar from './actions/fromAddressbar'
import actionsFromLocalStorage from './actions/fromLocalStorage'
import actionsFromPostMessage from './actions/fromPostMessage'

export default function intents (sources) {
  const actionsSources = [
    actionsFromDOM(sources.DOM),
    actionsFromAddressbar(sources.addressbar),
    actionsFromLocalStorage(sources.localStorage),
    actionsFromPostMessage(sources.postMessage)
  ]
  return mergeActionsByName(actionsSources)
}
