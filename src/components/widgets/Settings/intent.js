import {Rx} from '@cycle/core'
let fromEvent = Rx.Observable.fromEvent


export default function intent(DOM){
  let toggled$  = DOM.select(".toggler").events("click")
    .map(true)
    .scan((acc,val)=>!acc)
    .startWith(false)

  //any outside taps close the settings
  let outsideTaps$     = fromEvent(window,"click")
    .map(e=>e.target)
    .map(function(target){
      return document.querySelector(".settings").contains(target)
    })
    .filter(x=>(x===false))//we only care if it was clicked outside, not in

  toggled$ = toggled$.merge( outsideTaps$ )

  return {
    toggled$
  }
}