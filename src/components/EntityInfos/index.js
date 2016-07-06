import { combineLatestObj, exists } from '../../utils/obsUtils'

// import Comments from '../Comments'
import view from './view'
import intent from './intent'

////////
function model (props$, actions) {
  let comments$ = props$.pluck('comments').filter(exists).startWith(undefined)
  let meta$ = props$.pluck('meta').filter(exists).startWith(undefined)
  let transforms$ = props$.pluck('transforms').filter(exists).startWith(undefined)
  let settings$ = props$.pluck('settings').filter(exists).startWith(undefined)

  return combineLatestObj({meta$, transforms$, comments$, settings$})
    .distinctUntilChanged()
    .shareReplay(1)
}

// err bad naming ..also should this be part of the model
function refineActions (props$, actions) {
  const transforms$ = props$.pluck('transforms')
    .filter(exists)
    .map(e => e[0])
    .filter(exists)

  const changeTransforms$ = actions.changeTransforms$
    .withLatestFrom(transforms$, function (changed, transforms) {
      // let bla = assign({},transforms) // this does not create a new instance huh WHY????
      // let output = mergeData(transforms) //not working either ????
      let output = JSON.parse(JSON.stringify(transforms))

      output[changed.trans][changed.idx] = changed.val
      console.log('output', output)
      return output
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
    // addComment$
    }
  }
}

export default EntityInfos
