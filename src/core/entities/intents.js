import {mergeActionsByName} from '../../utils/obsUtils'

import actionsFromDOM from './actions/fromDOM'
//import actionsFromLocalStorage from './actions/fromLocalStorage'
import actionsFromPostMessage from './actions/fromPostMessage'


export default function intents(sources){
  const actionsSources = [
      actionsFromDOM(sources.DOM)
    //, actionsFromLocalStorage(sources.localStorage)
    , actionsFromPostMessage(sources.postMessage)
  ]
  return mergeActionsByName(actionsSources)
}
