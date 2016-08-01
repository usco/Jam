import { combineLatestObj } from '../../../utils/obsUtils'
import { h } from '@cycle/dom'
import startUpTour from './startUpTour.js'
import hopscotch from 'hopscotch'
require('./featureTour.css')

function intent (DOM) {
  var toggle$ = DOM.select('.startUpTourButton').events('click')
    .map(true)
    .startWith(false)
  return {toggle$}
}

function model (props$, actions) {
  const toggle$ = actions.toggle$.startWith(false)
  const firstRun$ = props$.map(e => false) // needs to change later
  return combineLatestObj({toggle$, firstRun$})
}

function view (state$) {
  return state$.map(function (state) {
    let active = state.toggle || state.firstRun
    let tour = startUpTour()

    hopscotch.registerHelper('hideArrow', function () {
      document.querySelector('.hopscotch-bubble-arrow-container').className += ' hidden'
    })
    hopscotch.registerHelper('clearState', function () {
      active = false
      tour = undefined
    })

    if (active) {
      hopscotch.startTour(tour)
      // this is nescessary to fix an initial calculation bug in hopscotch
      document.querySelector('.hopscotch-bubble').style.left = '25%'
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
