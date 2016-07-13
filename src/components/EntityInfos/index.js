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
    .withLatestFrom(changeTransformsBase$, transforms$, function(selections, data, transforms){
      let _transforms = JSON.parse(JSON.stringify(transforms)) // FIXME : this is needed because of mutation bug
      let avg = pluck(data.trans)(_transforms)
        .reduce(function (acc, cur) {
          if(!acc) return cur
          return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
        }, undefined)

      const res = assign({}, data, {value: avg, cmd: 'reset'})
      return res
    })

  const changeTransformsF$ = changeTransformsBase$.merge(selectionTransforms$)


  function combiner (stream) {
    return stream.scan(function(acc, changed){
      //console.log('acc', acc, changed)
      if(!acc){
        let diff = [0, 0, 0]
        diff[changed.id] = changed.value[changed.id]
        return [{diff, value: changed.value, trans: changed.trans, ids: changed.ids}]
      }else{
        if(changed.cmd === 'reset') {
        //const currentSelections = JSON.stringify(changed.ids)
        //const prevSelections = JSON.stringify(acc[0].ids)
        //if(currentSelections !== prevSelections){//selection changed, reset
          console.log('selection changed, reseting')
          let diff = [0, 0, 0]
          //diff[changed.id] = changed.value[changed.id]
          console.log('diff', diff, 'new', changed.value)
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
    //.tap(e=>console.log('res',e.diff, e))
    .map(function(data){
      const {diff, trans, ids} = data
      return ids.map(function(id){
        return {value: diff, trans, id}
      })
    })
    //.tap(e=>console.log('res2',e))

  }



  const changeTransforms$ = combiner(changeTransformsF$)
  /*changeTransformsBase$
    .bufferWithCount(2,1)
    .map(function(buffer){
      const [first, second] = buffer
      const diff = [second.value[0] - first.value[0], second.value[1] - first.value[1], second.value[2] - first.value[2]]
      //console.log('diff', diff, 'old', first.value, 'new', second.value)
      return {value: diff, trans: second.trans, id: second.id}
    })
    .merge(firstDiff$)

    .withLatestFrom(selections$, function(diff, selections){
      return selections.map(function(id, index){
        return assign({},diff,{id})
      })
    })*/

  /*const changeTransforms$ = actions.changeTransforms$
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
    })*/

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
