/** @jsx hJSX */
import { hJSX } from '@cycle/dom'
import Class from 'classnames'
import tooltipIconBtn from '../TooltipIconButton'

import Rx from 'rx'
const fromEvent = Rx.Observable.fromEvent

import { combineLatestObj } from '../../../utils/obsUtils'

function intent (DOM) {
  // any outside taps close the settings
  const outsideTaps$ = fromEvent(window, 'click')
    .map(e => e.target)
    .map(function (target) {
      return document.querySelector('.help').contains(target)
    })
    .filter(x => (x === false)) // we only care if it was clicked outside, not in

  const toggle$ = DOM.select('.helpToggler').events('click')
    .map(true)
    .scan((acc, val) => !acc)
    .merge(outsideTaps$)
    .takeUntil(outsideTaps$)
    .repeat()

  return {toggle$}
}

function model (props$, actions) {
  const toggled$ = actions.toggle$.startWith(false)
  const appVersion$ = props$.map(e => e.appData.version)

  return combineLatestObj({toggled$, appVersion$})
}

function view (state$) {
  const helpIconSvg = `<svg width="12px" height="19px" viewBox="0 0 12 19" class='icon'
  version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>help</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M6,1.42108547e-14 C2.69142857,1.42108547e-14 0,2.77582739 0,6.18742 C0,6.66684952 0.384,7.05595173 0.857142857,7.05595173 C1.33028571,7.05595173 1.71428571,6.66684952 1.71428571,6.18742 C1.71428571,3.77463887 3.67714286,1.73706345 6,1.73706345 C8.36228571,1.73706345 10.2857143,3.66172975 10.2857143,6.02761017 C10.2857143,8.39175352 8.36228571,10.3164198 6,10.3164198 C5.52685714,10.3164198 5.14285714,10.705522 5.14285714,11.1849515 L5.14285714,13.3545438 C5.14285714,13.8339733 5.52685714,14.2230755 6,14.2230755 C6.47314286,14.2230755 6.85714286,13.8339733 6.85714286,13.3545438 L6.85714286,11.992686 C9.76114286,11.5740538 12,9.05878588 12,6.02761017 C12,2.70287073 9.30857143,1.42108547e-14 6,1.42108547e-14 Z M6,19 C6.94677386,19 7.71428571,18.2222902 7.71428571,17.2629366 C7.71428571,16.3035829 6.94677386,15.5258731 6,15.5258731 C5.05322614,15.5258731 4.28571429,16.3035829 4.28571429,17.2629366 C4.28571429,18.2222902 5.05322614,19 6,19 Z" id="help" fill="#000000"></path>
    </g>
</svg>`

  return state$.map(function ({toggled, appVersion}) {
    const  content = <section className={Class('content', {toggled: toggled})}>
        <span className='helpItems'>
          <ul>
            <li>
              Click/tap and drag to rotate.
            </li>
            <li>
              Mouse wheel to zoom.
            </li>
            <li>
              Single click/tap to select items.
            </li>
            <li>
              Double click/tap to zoom on points/objects.
            </li>
          </ul>
        </span>
        <span className='appVersion'>Jam version {appVersion}</span>
      </section>

    return <div className='help'>
      {tooltipIconBtn({toggled, icon: helpIconSvg, klass: 'containerToggler helpToggler',
       tooltip: 'help', tooltipPos: 'top', content, contentPosition: 'top', arrow: false})}
     </div>
  })
}

export default function Help ({DOM, props$}, name = '') {
  const actions = intent(DOM)
  const state$ = model(props$, actions)
  const vtree$ = view(state$)

  return {
    DOM: vtree$
  }
}
