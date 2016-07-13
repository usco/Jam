import { combineLatestObj, exists } from '../../utils/obsUtils'

// import Comments from '../Comments'
import view from './view'
import intent from './intent'
import assign from 'fast.js/object/assign' // faster object.assign

import {pluck} from 'ramda'

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
  const activeTool$ = props$.pluck('settings','activeTool')
    .distinctUntilChanged()
    //.filter(exists)

  const changeTransformsBase$ = actions.changeTransforms$
    .tap(e=>console.log('changeTransforms',e))
    //.combineLatest(selections$)
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
      return {value:avg, trans:changed.trans, id:changed.idx, ids: selections}
    })
    .filter(x=> x.value !== undefined)
    .share()


  const selectionTransforms$ =
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
    return stream.scan(function(acc, changed){
      if(!acc){
        let diff = [0, 0, 0]
        if(changed.id){
          diff[changed.id] = changed.value[changed.id]
        }
        console.log('diff', diff, 'new', changed.value)
        return [{diff, value: changed.value, trans: changed.trans, ids: changed.ids}]
      }else{
        if(changed.cmd === 'reset') {
          //selection changed, reset
          //console.log('selection changed, reseting')
          let diff = [0, 0, 0]
          //console.log('diff', diff, 'new', changed.value)
          return [{diff, value: changed.value, trans: changed.trans, ids: changed.ids}]
        }

        if( acc.length < 2 ){ // adding a new one
          acc.push(changed)
        }
        if(acc.length === 2){
          const [first, second] = acc
          const diff = [second.value[0] - first.value[0], second.value[1] - first.value[1], second.value[2] - first.value[2]]
           console.log('diff', diff, 'old', first.value, 'new', second.value)
          return [{diff, value: second.value, trans: second.trans, ids: second.ids}]
        }
      }
    }, undefined)
    .filter(x => x.length === 1)
    .map(x=> x[0])
    .map(function(data){
      const {diff, trans, ids} = data
      return ids.map(function(id){
        return {value: diff, trans, id}
      })
    })
  }

  const changeTransforms$ = combiner(changeTransformsF$)
  
  return {
    changeMeta$: actions.changeMeta$,
    changeTransforms$
  }
}

function EntityInfos ({DOM, props$}, name = '') {
  const {changeMeta$, changeTransforms$} = refineActions(props$, intent(DOM))
  const state$ = model(props$)
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
    events: {
      changeMeta$,
      changeTransforms$
    }
  }
}

export default EntityInfos
