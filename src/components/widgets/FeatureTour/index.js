import { combineLatestObj } from '../../../utils/obsUtils'
import { h } from '@cycle/dom'
import startUpTour from './startUpTour.js'
import hopscotch from 'hopscotch'
require('./featureTour.css')
import rx from 'Rx'

function intent (DOM) {
  const closeSelection = new rx.ReplaySubject()
  hopscotch.registerHelper('clearState', function () {
    closeSelection.onNext(false)
  })

  let selected$ = DOM.select('.startUpTourLink').events('click')
      .map(true)
      .startWith(false)
      .merge(closeSelection)
  return {selected$}
}

function model (props$, actions) {
  const selected$ = actions.selected$.startWith(false)
  const firstRun$ = props$.map(e => false) // needs to change later
  return combineLatestObj({selected$, firstRun$})
}

function view (state$) {
  return state$.map(function (state) {
    let active = state.selected || state.firstRun
    // you can also use this to load other feature tours then just the startup tour
    let tour = startUpTour()

    hopscotch.registerHelper('hideArrow', function () {
      document.querySelector('.hopscotch-bubble-arrow-container').className += ' hidden'
    })
    if (active) {
      hopscotch.startTour(tour)

      // this is nescessary to fix an initial calculation bug in hopscotch
      if (parseInt(document.querySelector('.hopscotch-bubble').style.left) < 0) {
        document.querySelector('.hopscotch-bubble').style.left = '25%'
      }
    }
  })
}

export default function FeatureTour ({DOM, props$}) {
  let actions = intent(DOM)
  let state$ = model(props$, actions)
  let vtree$ = view(state$)
  return {
    DOM: vtree$
  }
}
