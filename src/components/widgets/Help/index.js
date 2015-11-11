/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import Class from "classnames"
import tooltipIconBtn from '../TooltipIconButton'

import {Rx} from '@cycle/core'
const fromEvent = Rx.Observable.fromEvent

import {combineLatestObj} from '../../../utils/obsUtils'


function intent(DOM){
  //any outside taps close the settings
  const outsideTaps$     = fromEvent(window,"click")
    .map(e=>e.target)
    .map(function(target){
      return document.querySelector(".help").contains(target)
    })
    .filter(x=>(x===false))//we only care if it was clicked outside, not in

  const toggle$  = DOM.select(".helpToggler").events("click")
    .map(true)
    .scan((acc,val)=>!acc)
    .merge(outsideTaps$)
    .takeUntil( outsideTaps$ )
    .repeat()    

  return {
    toggle$
  }
}


function model(props$, actions){
  const toggled$    = actions.toggle$.startWith(false)
  const appVersion$ = props$.map(e=>e.appData.version)

  return combineLatestObj({toggled$,appVersion$})
}


function view(state$){
  const helpIconSvg = `<svg version="1.1" id="Help" xmlns="http://www.w3.org/2000/svg" 
    width="16" height="16" x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" class="icon">
    <g>
      <path fill="#FFFFFF" d="M14.09,2.233C12.95,1.411,11.518,1,9.794,1C8.483,1,7.376,1.289,6.477,1.868
        C5.05,2.774,4.292,4.313,4.2,6.483h3.307c0-0.633,0.185-1.24,0.553-1.828c0.369-0.586,0.995-0.879,1.878-0.879
        c0.898,0,1.517,0.238,1.854,0.713C12.131,4.966,12.3,5.493,12.3,6.071c0,0.504-0.252,0.965-0.557,1.383
        c-0.167,0.244-0.387,0.469-0.661,0.674c0,0-1.793,1.15-2.58,2.074c-0.456,0.535-0.497,1.338-0.538,2.488
        c-0.002,0.082,0.029,0.252,0.315,0.252c0.287,0,2.316,0,2.571,0c0.256,0,0.309-0.189,0.312-0.274
        c0.018-0.418,0.064-0.633,0.141-0.875c0.144-0.457,0.538-0.855,0.979-1.199l0.91-0.627c0.822-0.641,1.477-1.166,1.767-1.578
        c0.494-0.676,0.842-1.51,0.842-2.5C15.8,4.274,15.23,3.057,14.09,2.233z M9.741,14.924c-1.139-0.035-2.079,0.754-2.115,1.99
        c-0.035,1.234,0.858,2.051,1.998,2.084c1.189,0.035,2.104-0.727,2.141-1.963C11.799,15.799,10.931,14.959,9.741,14.924z"/>
    </g>
    </svg>`

  return state$.map(function({toggled,appVersion}){

    let content = undefined

    if(toggled){
      content = <section className={Class("content", {toggled: toggled})}>
        <ul>
          <li>Click/tap and drag to rotate.</li>
          <li>Mouse wheel to zoom.</li>
          <li>Single click/tap to select items.</li>
          <li>Double click/tap to zoom on points/objects.</li>
        </ul>
        <span className="appVersion"> Jam version {appVersion}</span>
      </section>
    }

    return <div className="help">
      {tooltipIconBtn(toggled
          , helpIconSvg, "helpToggler", "help", "top")}

      {content}
    </div>
  })
}

export default function Help({DOM, props$}, name = '') {

  const actions = intent(DOM)  
  const state$  = model(props$, actions)
  const vtree$  = view(state$)

  return {
    DOM: vtree$
  }
}

