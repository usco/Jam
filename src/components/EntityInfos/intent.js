import {Rx} from '@cycle/core'
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest
import {combineLatestObj} from '../../utils/obsUtils'


export default function intent(DOM){
  const addComment$          = DOM.select(".comments").events("addComment$").pluck("detail")

  const changeName$  = merge(
    DOM.select(".nameInput").events('change')
    ,DOM.select(".nameInput").events('input')
  ).map(e=>e.target.value)
  .distinctUntilChanged()
  .debounce(20)
  .shareReplay(1)

  const changeColor$ = merge(
    DOM.select(".colorInput").events('change')
    ,DOM.select(".colorInput").events('input')
  ).map(e=>e.target.value)
  .distinctUntilChanged()
  .debounce(20)
  .shareReplay(1)

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
    //.debounce(20)
    .shareReplay(1)
  
  return {
    changeName$
    ,changeColor$
    ,changeTransforms$
  }
}