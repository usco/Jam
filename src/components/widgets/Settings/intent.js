import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent

export default function intent (DOM) {
  // any outside taps close the settings
  const outsideTaps$ = fromEvent(window, 'click')
    .map(e => e.target)
    .map(function (target) {
      return document.querySelector('.settings').contains(target)
    })
    .filter(x => (x === false)) // we only care if it was clicked outside, not in

  const toggle$ = DOM.select('.settingsToggler').events('click')
    .map(true)
    .scan((acc, val) => !acc)
    .merge(outsideTaps$)
    .takeUntil(outsideTaps$)
    .repeat()

  return {
  toggle$}
}
