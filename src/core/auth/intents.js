import { mergeActionsByName } from '../../utils/obsUtils'

import actionsFromAddressbar from './actions/fromAddressbar'

export default function intents (sources) {
  const actionsSources = [
    actionsFromAddressbar(sources.addressbar)
  ]
  return mergeActionsByName(actionsSources)
}
