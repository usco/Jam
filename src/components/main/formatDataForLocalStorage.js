import { omit } from 'ramda'

export default function formatDataForLocalStorage ({sources, state$}) {
  return state$ // output to localStorage
    .pluck('settings') // in this case, settings
    .map(function (settings) {
      return omit(['autoSave', 'autoLoad'], settings) // here put any settings that should NOT be saved
    })
    .map(s => ({'jam!-settings': JSON.stringify(s)}))
}
