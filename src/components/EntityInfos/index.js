import { combineLatestObj, exists } from '../../utils/obsUtils'

// import Comments from '../Comments'
import view from './view'
import intent from './intent'
import assign from 'fast.js/object/assign' // faster object.assign

import {pluck, head} from 'ramda'

//
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
  const bounds$ = props$.pluck('bounds')
    .filter(exists)
    .filter(x=>x.length>0)
  const activeTool$ = props$.pluck('settings', 'activeTool')
    .distinctUntilChanged()

  bounds$.forEach(e=>console.log('GNAGNAbounds',e[0].min,e[0].max))

  const boundsChange$ = actions.changeBounds$
    .withLatestFrom(bounds$, transforms$, selections$, function (changed, bounds, transforms, selections) {

      let __currentAvg = pluck('size')(bounds)
        .reduce(function (acc, cur) {
          if(!acc) return cur
          return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
        }, undefined)


      //FIXME ; hack !!! we should be able to use the size directly
      let currentAvg = bounds.map(function(bound){
        return [bound.max[0] - bound.min[0], bound.max[1] - bound.min[1], bound.max[2] - bound.min[2]]
      }).reduce(function (acc, cur) {
        if(!acc) return cur
        return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
      }, undefined)

      let scaleAvg = pluck('sca')(transforms)
        .reduce(function (acc, cur) {
          if(!acc) return cur
          return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
        }, undefined)

      let newValue = Object.assign([] ,currentAvg)
      newValue[changed.idx] = changed.val
      let diff = [newValue[0] - currentAvg[0], newValue[1] - currentAvg[1], newValue[2] - currentAvg[2]]
      let scaleChange = [diff[0] /currentAvg[0], diff[1] / currentAvg[1], diff[2] / currentAvg[2]]
        .map((x, idx)=>x+scaleAvg[idx])

      console.log('diff',diff[0], newValue[0], currentAvg[0])//, scaleAvg[0], scaleChange[0])

      return {value: scaleChange, trans: 'sca', ids: selections}
    })
    .tap(e=>console.log('scaleChange', e.value[0]))

  const changeBounds$ = actions.changeBounds$
    .withLatestFrom(bounds$, selections$, function (changed, bounds, selections) {
      let currentAvg = pluck('size')(bounds)
        .reduce(function (acc, cur) {
          if(!acc) return cur
          return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
        }, undefined)

        let newValue = Object.assign([] ,currentAvg)
        newValue[changed.idx] = changed.val
        return {value: newValue, ids: selections}
    })
    .map(function(data){
      const {value, ids} = data
      return ids.map(function(id){
        return {value, id}
      })
    })
    .share()

  const changeTransformsBase$ = actions.changeTransforms$
    .withLatestFrom(transforms$, selections$, function (changed, transforms, selections) {
      let _transforms = JSON.parse(JSON.stringify(transforms)) // FIXME : this is needed because of mutation bug
      let avg = pluck(changed.trans)(_transforms)
        .reduce(function (acc, cur) {
          if(!acc) return cur
          return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
        }, undefined)

      if(avg){
        avg[changed.idx] = changed.val
      }
      return {value: avg, trans: changed.trans, ids: selections}
    })
    .merge(boundsChange$)
    .filter(x=> x.value !== undefined)
    .map(function(data){
      const {value, trans, ids} = data
      return ids.map(function(id){
        return {value: value, trans, id}
      })
    })
    .share()
    //.tap(e=>console.log('transforms',e))



  /*const selectionTransforms$ =
    selections$.distinctUntilChanged()
    .withLatestFrom(transforms$, (selections, transforms) => ({selections, transforms}))
    .combineLatest(activeTool$, function ({selections, transforms}, activeTool) {
      const trans = {'translate': 'pos', 'rotate': 'rot', 'scale': 'sca'}[activeTool]
      let _transforms = JSON.parse(JSON.stringify(transforms)) // FIXME : this is needed because of mutation bug
      let avg = pluck(trans)(_transforms)
        .reduce(function (acc, cur) {
          if(!acc) return cur
          return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
        }, undefined)
      return {value: avg, trans: trans, ids: selections, cmd: 'reset'}
    })
    .filter(x=> x.value !== undefined && x.trans !== undefined)

  const changeTransformsF$ = changeTransformsBase$.merge(selectionTransforms$)


  function combiner (stream) {
    return stream.scan(function (acc, changed) {
      if(!acc) {
        let diff = [0, 0, 0]
        if(changed.id) {
          diff[changed.id] = changed.value[changed.id]
        }
        //console.log('diff', diff, 'new', changed.value)
        return [{diff, value: changed.value, trans: changed.trans, ids: changed.ids}]
      }else{
        if(changed.cmd === 'reset')// selection changed, reset
        {
          //console.log('selection changed, reseting')
          let diff = [0, 0, 0]
          //console.log('diff', diff, 'new', changed.value)
          return [{diff, value: changed.value, trans: changed.trans, ids: changed.ids}]
        }

        if(acc.length < 2) { // adding a new one
          acc.push(changed)
        }
        if(acc.length === 2) {
          const [first, second] = acc
          const diff = [second.value[0] - first.value[0], second.value[1] - first.value[1], second.value[2] - first.value[2]]
          //console.log('diff', diff, 'old', first.value, 'new', second.value)
          return [{diff, value: second.value, trans: second.trans, ids: second.ids}]
        }
      }
    }, undefined)
    .filter(x => x.length === 1)
    .map(head)
    .map(function(data){
      const {diff, trans, ids} = data
      return ids.map(function(id){
        return {value: diff, trans, id}
      })
    })
    .tap(e=>console.log('input FIRST',e))
  }

  const changeTransforms$ = combiner(changeTransformsF$)*/
  const changeTransforms$ = changeTransformsBase$
  const resetScaling$ = actions.resetScaling$
      .withLatestFrom(selections$, function (_, selections) {
        return {ids: selections}
      })
      .filter(exists)
      .map(function(data){
        const {ids} = data
        return ids.map(id => ({id}))
      })

  return {
    changeMeta$: actions.changeMeta$,
    changeBounds$,
    changeTransforms$,
    resetScaling$

  }
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
      resetScaling$
    }
  }
}

export default EntityInfos
