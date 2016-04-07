import { combineLatestObj, exists } from '../../../utils/obsUtils'

// import Comments from '../Comments'
import view from './view'
import intent from './intent'

// //////
import ColorPicker from '../ColorPicker'

export function colorPickerWrapper (state$, DOM) {
  console.log('making colorPicker')
  const props$ = // just({color:"#FF00FF"})
  state$.map(function (state) {
    let {meta, transforms} = state

    if (!meta || !transforms) {
      return undefined
    }
    if (transforms.length > 0) transforms = transforms[0]
    if (meta.length > 0) meta = meta[0]

    return {color: meta.color}
  })

  return ColorPicker({DOM, props$})
}

// //////

function model (props$, actions) {
  let comments$ = props$.pluck('comments').filter(exists).startWith(undefined)
  let meta$ = props$.pluck('meta').filter(exists).startWith(undefined)
  let transforms$ = props$.pluck('transforms').filter(exists).startWith(undefined)

  return combineLatestObj({meta$, transforms$, comments$})
    .distinctUntilChanged()
    .shareReplay(1)
}

// err bad naming ..also should this be part of the model
function refineActions (props$, actions) {
  const transforms$ = props$.pluck('transforms')
    .filter(exists)
    .map(e => e[0])

  const changeTransforms$ = actions.changeTransforms$
    .withLatestFrom(transforms$, function (changed, transforms) {
      // let bla = assign({},transforms) // this does not create a new instance huh WHY????
      // let output = mergeData(transforms) //not working either ????
      let output = JSON.parse(JSON.stringify(transforms))

      output[changed.trans][changed.idx] = changed.val
      return output
    })
  return {
    changeMeta$: actions.changeMeta$,
    changeTransforms$
  }
}

function EntityInfos ({DOM, props$}, name = '') {
  const state$ = model(props$)

  const {changeMeta$, changeTransforms$} = refineActions(props$, intent(DOM))
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
