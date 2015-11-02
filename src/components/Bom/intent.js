import {Rx} from '@cycle/core'
const fromEvent = Rx.Observable.fromEvent

export default function intent(DOM){
  const entryTapped$  = DOM.select(".bomEntry").events('click',true)//capture == true
    .do(e=>e.stopPropagation())
    .map(e => e.currentTarget.dataset.id)
    //e.target.attributes["data-transform"].value    
  const headerTapped$ = DOM.select(".headerCell").events('click',true)
    .do(e=>e.stopPropagation())
  const removeEntry$ = DOM.select('DOM', '.remove-btn').events('click',true)
    .do(e=>e.stopPropagation())

  //any outside taps close the dialog
  const outsideTaps$     = fromEvent(window,"click")
    .map(e=>e.target)
    .map(function(target){
      return document.querySelector(".bom").contains(target)
    })
    .filter(x=>(x===false))//we only care if it was clicked outside, not in
  
  const toggle$  = DOM.select(".bomToggler").events("click")//toggle should be scoped?
    .map(true)
    .scan((acc,val)=>!acc)
    .merge(outsideTaps$)
    .takeUntil( outsideTaps$ )
    .repeat() 

  return {
    entryTapped$
    ,headerTapped$
    ,removeEntry$
    ,toggle$
  }
}