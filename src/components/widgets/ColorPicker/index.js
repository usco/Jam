/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from "classnames"
const fromEvent = Rx.Observable.fromEvent

const combineLatest = Rx.Observable.combineLatest
const just = Rx.Observable.just 
import {combineLatestObj} from '../../../utils/obsUtils'
import {exists} from '../../../utils/utils'
import {equals} from 'Ramda'

function intent({DOM}){
  console.log("intent for colorPicker")
  //any outside taps close the colorpicker
  const outsideTaps$     = fromEvent(window,"click")
    .map(e=>e.target)
    .map(function(target){
      return document.querySelector(".color").contains(target)
    })
    .filter(x=>(x===false))//we only care if it was clicked outside, not in
    .do(e=>console.log("outsideTaps")) 

  const toggled$  = DOM.select(".color").events("click")
    .map(true)
    .scan((acc,val)=>!acc)
    .startWith(false)
    //.do(e=>console.log("insideTaps"))
    .merge( outsideTaps$ )

  return {
    toggled$
  }
}

function model(props$, actions){
  console.log("creating model")
  const color$   = props$.pluck("color")
  const toggled$ = just(true)//actions.toggled$

  
  return combineLatestObj({
    toggled$
    ,color$
  })
  .distinctUntilChanged(null,equals)
  .shareReplay(1)
  .do(e=>console.log("model for colorPicker",e))
  
  //return just({color:"#FF0000"})
}



function view(state$) {
  //state$.subscribe(e=>console.log("colorpicker state ",e))
  /*var dom = document.getElementById('mainHolder');
  dom.style.backgroundImage = '-moz-linear-gradient('
        + orientation + ', ' + colorOne + ', ' + colorTwo + ')';*/

  return state$
    .map(function(state){
      const inputStyle = `background:${state.color}`

      const startColor = "#FF0000"
      const endColor   = "#00FF00"
      const smallGradientStyle = `background:  linear-gradient( 90deg, ${startColor}, ${endColor} )`

      const startColorBig = "#FF0000"
      const endColorBig   = "#00FF00"
      const bigGradientStyle = `background:  linear-gradient( 45deg, ${startColorBig}, ${endColorBig} )`

      const compact = <span className='colorpicker'>
        <span className='color' attributes={ {style:inputStyle} }/> 
      </span>

      const full    = <span className='colorpicker'>
        <span className='color'  attributes={ {style:inputStyle} }/> 

        <div className='body'> 
          <div className='mainGradient'  attributes={{style:bigGradientStyle}} />
          <div className='smallGradient' />
        </div>
      </span>

      if(state.toggled){
        return full
      }
      return compact
  })
  .distinctUntilChanged(null,equals)
  .shareReplay(1)
}

export default function ColorPicker({DOM,props$}){
  const actions  = intent({DOM})
  const state$   = model(props$, actions)
  const vtree$   = view(state$)

  return {
    DOM:vtree$
  }
}