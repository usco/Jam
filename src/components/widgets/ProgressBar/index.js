import { h } from '@cycle/dom'
import { combineLatestObj } from '../../../utils/obsUtils'
import { exists } from '../../../utils/utils'
require('./style.css')


function v2 (state) {
  const defaults = {
    progress: 0,
    hideOnDone: true
  }
  const {progress, hideOnDone} = Object.assign({}, defaults, state)

  const element = (hideOnDone && progress === 100) ? h('div')
     : h('div.progressBar', [h('span.fill', { style: { width: `${progress}%` } })])
  return element
}


function model (props$, actions) {
  const progress$ = props$.pluck('progress')
  const hideOnDone$ = props$.pluck('hideOnDone').filter(exists).startWith(true)
  return combineLatestObj({progress$, hideOnDone$})
}

function view (state$) {
  return state$.map(function (state) {
    const progress = state.progress
    //const style = `width:${progress}%`

    let element = h('div.progressBar', [
      h('span.fill', {style: {width: `${progress}%` }})

    ])

    if (state.hideOnDone && progress === 100) {
      element = h('div') // returning 'undefined' can have weird side effects ! carefull
    }
    return element
  })
}

export default function ProgressBar ({DOM, props$}) {
  const state$ = model(props$)
  const vtree$ = view(state$)

  return {
    DOM: vtree$
  }
}
