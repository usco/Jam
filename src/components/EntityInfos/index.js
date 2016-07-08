import { combineLatestObj, exists } from '../../utils/obsUtils'

// import Comments from '../Comments'
import view from './view'
import intent from './intent'
import assign from 'fast.js/object/assign' // faster object.assign

// //////
function model (props$, actions) {
  return props$.map(function (props) {
    const {comments, meta, transforms, settings} = props
    return {comments, meta, transforms, settings}
  })
    .startWith({comments: undefined,meta: undefined, transforms: undefined, settings: undefined})
    .distinctUntilChanged()
    .shareReplay(1)
}

// err bad naming ..also should this be part of the model
function refineActions (props$, actions) {
  const transforms$ = props$.pluck('transforms')
    .filter(exists)

  const changeTransforms$ = actions.changeTransforms$
    .withLatestFrom(transforms$, function (changed, transforms) {
      return transforms.map(function(transform){
        // let output = assign({},transforms) // this does not create a new instance huh WHY????
        // let output = mergeData(transforms) // not working either ????
        let output = JSON.parse(JSON.stringify(transform))
        output[changed.trans][changed.idx] = changed.val
        console.log('output', output)
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
  // const colorPicker = colorPickerWrapper(state$, DOM)
  const vtree$ = view(state$) // , colorPicker.DOM)

  return {
    DOM: vtree$,
    events: {
      changeMeta$,
      changeTransforms$
    }
  }
}

export default EntityInfos
