import {Rx} from '@cycle/core'
let merge = Rx.Observable.merge
let just  = Rx.Observable.just

export default function intent(DOM){
  const toggle$    = DOM.select(".commentsBtn").events("click")
    .map(true)
    .startWith(false)
    .scan((acc,val)=>!acc)

  const newCommentContent$ = merge(//stream containing new comment, if any
    DOM.select(".newCommentContent").events("input")
    //,DOM.select(".newCommentContent").events("keyup")
  ).map(e=>e.target.value)
    .startWith("")
    .distinctUntilChanged()
    .shareReplay(1)

  const addComment$  = DOM.select(".add").events("click")
    .withLatestFrom(newCommentContent$,function(nC,newCommentContent){
      return newCommentContent
    })

  return {
    addComment$
    ,newCommentContent$
    ,toggle$
  }
}