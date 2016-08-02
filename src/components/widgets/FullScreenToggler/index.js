import { html } from 'snabbdom-jsx'
import Menu from '../Menu'
import screenfull from 'screenfull'
require('./fullScreenToggler.css')


function intent ({DOM}) {
  const toggle$ = DOM.select('.fullScreenToggler').events('click')
    .map(true)
    .startWith(false)
    .scan((acc, val) => !acc)

  return toggle$
}

function view (state$) {
  return state$
    .map(function (toggle) {
      if (screenfull.enabled) {
        screenfull.toggle()
      }
      let tooltip = toggle ? 'exit fullscreen' : 'fullscreen'
      let icon
      if (!screenfull.isFullscreen) {
        icon = `
        <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 25 25" class='icon'
              version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
        <title>fullscreen</title>
        <desc>Created with Sketch.</desc>
        <defs></defs>
        <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <path d="M23,8 L23,17 L29,12.5 L23,8 Z M15,12 L23,12 L23,13 L15,13 L15,12 Z M2,8 L2,17 L-4,12.5 L2,8 Z M10,12 L2,12 L2,13 L10,13 L10,12 Z" id="fullscreen" fill="#000000" transform="translate(12.500000, 12.500000) rotate(-45.000000) translate(-12.500000, -12.500000) "></path>
        </g>
      </svg>`
      } else {
        icon = `<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 25 25" class='icon'
        version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
          <title>normal-screen</title>
          <desc>Created with Sketch.</desc>
          <defs></defs>
          <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <path d="M20.495689,7.99568901 L20.495689,16.995689 L14.495689,12.495689 L20.495689,7.99568901 Z M20.495689,11.995689 L28.495689,11.995689 L28.495689,12.995689 L20.495689,12.995689 L20.495689,11.995689 Z M4.49568901,7.99568901 L4.49568901,16.995689 L10.495689,12.495689 L4.49568901,7.99568901 Z M4.49568901,11.995689 L-3.50431099,11.995689 L-3.50431099,12.995689 L4.49568901,12.995689 L4.49568901,11.995689 Z" id="normal-screen" fill="#000000" transform="translate(12.495689, 12.495689) rotate(-45.000000) translate(-12.495689, -12.495689) "></path>
          </g>
      </svg>`
      }
      return Menu({toggle, icon, klass: 'fullScreenToggler containerToggler', tooltip: tooltip, tooltipPos: 'top'})
    })
}

function FullScreenToggler ({DOM, props}) {
  const state$ = intent({DOM}) // cheating a bit
  const vtree$ = view(state$)

  return {
    DOM: vtree$
  }
}

export default FullScreenToggler
