/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from "classnames"
const combineLatest = Rx.Observable.combineLatest
const just = Rx.Observable.just 
import {combineLatestObj} from '../../../utils/obsUtils'

function intent(drivers){

}

function model(props$, actions){
  const progress$ = props$.pluck("progress")
  return combineLatestObj({progress$})
}

function view(state$) {

  return state$.map(function(state){
    console.log("state",state)
    const progress = state.progress*100
    const style = `width:${progress}%`

    return <span className='progressBar'> 
      <span className='fill' attributes={ {style} }/> 
    </span>
  })
}

export default function ProgressBar({DOM,props$}){
  const state$ = model(props$)
  const vtree$ = view(state$)

  return {
    DOM:vtree$
  }
}