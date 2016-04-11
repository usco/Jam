export default function formatDataForLocalStorage ({sources, state$}) {
  return state$ // output to localStorage
    .pluck('settings') // in this case, settings
    .map(s => ({'jam!-settings': JSON.stringify(s)}))
}
