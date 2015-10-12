import {Rx} from '@cycle/core'
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest
import {combineLatestObj} from '../../utils/obsUtils'


export default function intent(DOM){
  const addComment$          = DOM.select(".comments").events("addComment$").pluck("detail")

  const changeName$  = merge(
    DOM.select(".nameInput").events('change').map(e=>e.target.value)
    ,DOM.select(".nameInput").events('input').map(e=>e.target.value)
  )
  const changeColor$ = DOM.select(".colorInput").events('change').map(e=>e.target.value)

  const changeTransforms$ = merge(
    DOM.select(".transformsInput").events('change')
    ,DOM.select(".transformsInput").events('input')
  )
    .map(function(e){
      let val = parseFloat(e.target.value)
      let dtrans = e.target.attributes["data-transform"].value
      let [trans,idx]   = dtrans.split("_")
      return {val,trans,idx:parseInt(idx)}
    })
    .distinctUntilChanged()
  
  return {
    changeName$
    ,changeColor$
    ,changeTransforms$
  }
}