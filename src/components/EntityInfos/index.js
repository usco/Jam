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

  /*
  const changeTransformsBase$ = actions.changeTransforms$
    .withLatestFrom(transforms$, selections$, function (changed, transforms) {
      let _transforms = JSON.parse(JSON.stringify(transforms)) // FIXME : this is needed because of mutation bug

      let avg = pluck(changed.trans)(_transforms)
        .reduce(function (acc, cur) {
          if(!acc) return cur
          return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
        }, undefined)
      avg[changed.idx] = changed.val
      return {value: avg, trans: changed.trans, id: changed.idx}
    })//.merge(selections$.distinctUntilChanged().map(x => ({ value:[0,0,0] }) ))

  const firstDiff$ = actions.changeTransforms$
    .take(1)
    .map( function (changed) {
      let diff = [0, 0, 0]
      diff[changed.idx] = changed.val
      return {value: diff, trans: changed.trans, id: changed.idx}
    })

  const changeTransformsBasePos$ = changeTransformsBase$
    .filter(({trans}) => trans === 'pos')

  const changeTransformsBaseRot$ = changeTransformsBase$
    .filter(({trans}) => trans === 'rot')

  const changeTransforms$ = changeTransformsBase$
    .bufferWithCount(2,1)
    .map(function(buffer){
      const [first, second] = buffer
      const diff = [second.value[0] - first.value[0], second.value[1] - first.value[1], second.value[2] - first.value[2]]
      console.log('diff', diff, 'old', first.value, 'new', second.value)
      return {value: diff, trans: second.trans, id: second.id}
    })
    .merge(firstDiff$)

    .withLatestFrom(selections$, function(diff, selections){
      return selections.map(function(id, index){
        return assign({},diff,{id})
      })
    })
  */
  const changeTransforms$ = actions.changeTransforms$
    .tap(e=>console.log('changeTransforms',e))
    .withLatestFrom(transforms$, selections$, function (changed, transforms, selections) {
      return transforms.map(function(transform){
        // let output = assign({},transforms) // this does not create a new instance huh WHY????
        // let output = mergeData(transforms) // not working either ????
        let output = JSON.parse(JSON.stringify(transform))
        output[changed.trans][changed.idx] = changed.val
        output.id = selections[0]
        console.log(output.id,changed.idx)

        return output
      })
    })

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
