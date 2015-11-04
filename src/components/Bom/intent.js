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
 
  const changeEntryValue$ = DOM.select('.bomEntry input[type=text]').events('change')
    .do(e=>e.stopPropagation())
    .map(function(e){
      const actualTarget = e.currentTarget.parentElement.dataset
      return {
        id:actualTarget.id
        ,attrName:actualTarget.name
        ,value:e.target.value
      }
    })
  const checkEntry$ = DOM.select('.bomEntry input[type=checkbox]').events('change')
    .do(e=>e.stopPropagation())
    .map(function(e){
      const actualTarget = e.currentTarget.parentElement.dataset
      return {
        id:actualTarget.id
        ,attrName:actualTarget.name
        ,value:e.target.checked
      }
    })

  const editEntry$ = Rx.Observable.merge(
    changeEntryValue$
    ,checkEntry$
    )

  const toggle$  = DOM.select(".bomToggler").events("click")//toggle should be scoped?
    .map(true)
    .scan((acc,val)=>!acc)

  return {
    entryTapped$
    ,headerTapped$
    ,editEntry$
    ,removeEntry$
    ,toggle$
  }
}