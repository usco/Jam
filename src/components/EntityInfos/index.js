import { combineLatestObj, exists } from '../../utils/obsUtils'

// import Comments from '../Comments'
import view from './view'
import intent from './intent'
import assign from 'fast.js/object/assign' // faster object.assign

import { pluck, head } from 'ramda'

/* pipeiline
  ask geometry for actual "raw" bounds
  ask transforms for scale
  "real bounds" => rawBounds * scale

  wanna update scale based on bounds ?
  - what is the current real bounds?
  - what is raw bounds ?
  - compute new scale

  VOILA!
*/

function reduceToAverage (acc, cur) {
  if (!acc) return cur
  return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
}

function averageAndSetByFieldname(fieldName, changed, data){
  const average = pluck(fieldName)(data)
    .reduce(reduceToAverage, undefined)

  let value = Object.assign([], currentAvg)
  value[changed.idx] = changed.val
  return {value, average}
}

// "spread" data to a list, by ids value over a list of ids
function spreadToAll (fieldNames){
  return function(data) {
    const {ids} = data
    return ids.map(function (id) {
      let result = {}
      fieldNames.forEach(f => {result[f] = data[f]})
      result['id'] = id
      return result
    })
  }
}

function model (props$, actions) {
  return props$.map(function (props) {
    const {comments, meta, transforms, settings} = props
    return {comments, meta, transforms, settings}
  })
    .startWith({comments: undefined, meta: undefined, transforms: undefined, settings: undefined})
    .distinctUntilChanged()
    .shareReplay(1)
}

// err bad naming ..also should this be part of the model
function refineActions (props$, actions) {
  const selections$ = props$.pluck('selections')
  const transforms$ = props$.pluck('transforms')
    .filter(exists)
    .filter(x => x.length > 0)
  const bounds$ = props$.pluck('bounds')
    .filter(exists)
    .filter(x => x.length > 0)
  const activeTool$ = props$.pluck('settings', 'activeTool')
    .distinctUntilChanged()

  // bounds$.forEach(e=>console.log('GNAGNAbounds',e[0].min,e[0].max))

  const changeBoundsBase$ = actions.changeBounds$
    .withLatestFrom(bounds$, selections$, function (changed, bounds, selections) {
      const currentAvg = pluck('size')(bounds)
        .reduce(reduceToAverage, undefined)

      let newValue = Object.assign([], currentAvg)
      newValue[changed.idx] = changed.val
      return {oldValue: currentAvg, value: newValue, ids: selections}
    })
    .filter(exists)
    .shareReplay(1)

  const changeBounds$ = changeBoundsBase$
    .map(spreadToAll(['value', 'trans']))
    .share()

  const scaleFromBounds$ = changeBoundsBase$
    .withLatestFrom(bounds$, transforms$, selections$, function (changedBounds, bounds, transforms, selections) {
      const currentAvg = changedBounds.oldValue
      const newValue = changedBounds.value
      let scaleChange = [newValue[0]/ currentAvg[0], newValue[1]/ currentAvg[1],
        newValue[2] / currentAvg[2]]
      return {value: scaleChange, trans: 'sca', ids: selections}
    })
    //.tap(e => console.log('scaleChange', e.value[0]))

  const changeTransforms$ = actions.changeTransforms$
    .withLatestFrom(transforms$, selections$, function (changed, transforms, selections) {
      let avg = pluck(changed.trans)(transforms)
        .reduce(reduceToAverage, undefined)
      avg[changed.idx] = changed.val

      return {value: avg, trans: changed.trans, ids: selections}
    })
    .merge(scaleFromBounds$)
    .filter(x => x.value !== undefined)
    .map(spreadToAll(['value', 'trans']))
    .share()
    // .tap(e=>console.log('transforms',e))

  const resetScaling$ = actions.resetScaling$
    .withLatestFrom(selections$, function (_, selections) {
      return {ids: selections}
    })
    .filter(exists)
    .map(spreadToAll([]))

  return {
    changeMeta$: actions.changeMeta$,
    changeBounds$,
    changeTransforms$,
  resetScaling$}
}

function EntityInfos ({DOM, props$}, name = '') {
  const {changeMeta$, changeTransforms$, changeBounds$, resetScaling$} = refineActions(props$, intent(DOM))
  const state$ = model(props$)
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
    events: {
      changeMeta$,
      changeBounds$,
      changeTransforms$,
    resetScaling$}
  }
}

export default EntityInfos
