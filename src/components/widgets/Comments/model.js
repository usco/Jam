import {Rx} from '@cycle/core'
let merge = Rx.Observable.merge
let just  = Rx.Observable.just
import {combineLatestObj} from '../../../utils/obsUtils'

export default function model(props$, actions){
  const comments$   = props$.pluck('comments')
  const entity$     = props$.pluck('entity')
  const toggled$    = actions.toggle$

  const newCommentContent$ = actions.addComment$
    .map(function(){return "" })//if new comment has been submited, reset to empty field
    .startWith(undefined)

  const state$ = combineLatestObj({
    comments$
    ,newCommentContent$
    ,entity$
    ,toggled$}).distinctUntilChanged()

  return state$ 
}
