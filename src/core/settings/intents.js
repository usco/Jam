import {mergeActionsByName} from '../../utils/obsUtils'

import settingsIntentFromDOM from './actions/fromDOM'
import settingsIntentFromAddressbar from './actions/fromAddressbar'
import settingsIntentFromLocalStorage from './actions/fromLocalStorage'
import settingsIntentFromPostMessage from './actions/fromPostMessage'


export default function intents(sources){
  const settingActionSources = [
      settingsIntentFromDOM(sources.DOM)
    , settingsIntentFromAddressbar(sources.addressbar)
    , settingsIntentFromLocalStorage(sources.localStorage)
    , settingsIntentFromPostMessage(sources.postMessage)
  ]
  return mergeActionsByName(settingActionSources)
}
