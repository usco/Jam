/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from 'classnames'
let merge = Rx.Observable.merge
let just  = Rx.Observable.just

import {preventDefault,isTextNotEmpty,formatData,exists} from '../../../utils/obsUtils'
import view from './view'


//helper function, tor return uids (type/instance)
function getIds(entity){
  console.log("getIds")
  if(entity){
    return {typeUid:entity.typeUid, iuid:entity.id}
  }
  return {typeUid:undefined, iuid:undefined}
}

function intent(DOM){
  const toggle$    = DOM.select(".comments").events("toggle")
    .map(true)
    .startWith(false)
    .scan((acc,val)=>!acc)

  const addCommentStart$ = DOM.select(".add").events("click")

  //stream containing new comment, if any
  let addComment$ = Rx.Observable.just("foo") //interactions.subject('newCommentContent$')
    .map(e=>e.target.value)
    .startWith(undefined)
    .map(e=>{ return {text:e} })
    .shareReplay(1)

  addComment$ = addComment$
    .withLatestFrom(
      newComment$
      ,entity$.map(getIds)
      ,function(a,commentText,entityData){
        return { text:commentText.text, target:entityData}
      })
    .shareReplay(1)

  newComment$ = 
    merge(
      newComment$,
      addComment$.map({text:undefined})
    )

  return {
    newComment$
    ,toggle$
  }
}

function model(props$){
  const comments$   = props$.pluck('comments')
  const entity$     = props$.pluck('entity')


  const state$ = just(undefined)//combineLatest()
  return state$
}


function Comments({DOM,props$}) {
  const model$ = model(props$)
  const vtree$ = view()

  return {
    DOM: vtree$,
    /*events:{
      addComment$
    }*/
  }
}

export default Comments
