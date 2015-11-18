import Rx from 'rx'
let merge = Rx.Observable.merge
let just  = Rx.Observable.just

export default function intent(DOM){
  const toggle$    = DOM.select(".commentsToggler").events("click")
    .map(true)
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