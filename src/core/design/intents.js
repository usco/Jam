import {mergeActionsByName} from '../../utils/obsUtils'

import actionsFromDOM from './actions/fromDOM'
import actionsFromAddressbar from './actions/fromAddressbar'
import actionsFromPostMessage from './actions/fromPostMessage'

export default function intents(sources){
  const actionsSources = [
      actionsFromDOM(sources.DOM)
    , actionsFromAddressbar(sources.addressbar)
    , actionsFromPostMessage(sources.postMessage)
  ]
  return mergeActionsByName(actionsSources)
}
