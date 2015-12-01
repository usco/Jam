/** @jsx hJSX */
import Cycle from '@cycle/core'
import Rx from 'rx'
import {hJSX} from '@cycle/dom'
import Class from "classnames"
const combineLatest = Rx.Observable.combineLatest
const just = Rx.Observable.just 
import {combineLatestObj} from '../../../utils/obsUtils'
import {exists} from '../../../utils/utils'


function intent(drivers){

}

function model(props$, actions){
  const progress$ = props$.pluck("progress")
  const hideOnDone$ = props$.pluck("hideOnDone").filter(exists).startWith(true)
  return combineLatestObj({progress$,hideOnDone$})
}

function view(state$) {
  return state$.map(function(state){
    
    const progress = state.progress
    const style = `width:${progress}%`

    let element = <div className='progressBar'> 
        <span className='fill' attributes={ {style} }/> 
      </div>

    if(state.hideOnDone && progress === 100 ){
      element = <div/> //returning "undefined" can have weird side effects ! carefull
    }
    return element
  })
}

export default function ProgressBar({DOM,props$}){
  const state$ = model(props$)
  const vtree$ = view(state$)

  return {
    DOM:vtree$
  }
}