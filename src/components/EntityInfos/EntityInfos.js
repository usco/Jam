/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from 'classnames'
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest

import {combineLatestObj, preventDefault,isTextNotEmpty,formatData,exists} from '../../utils/obsUtils'

import Comments from '../Comments/Comments'
import view from './View'


////////

function model(props$, actions){
  let comments$   = props$.pluck('comments').filter(exists).startWith(undefined)
  let core$       = props$.pluck('core').filter(exists).startWith(undefined)
  let transforms$ = props$.pluck('transforms').filter(exists).startWith(undefined)
  return combineLatestObj({core$, transforms$, comments$})
}

function CommentsWrapper(state$, DOM){
  const commentsEntity$ = state$.pluck("core")
    .filter(exists)
    .map(e=>e[0])
    .startWith(undefined)

  const props$ = combineLatestObj({
    entity:commentsEntity$
    ,comments:state$.pluck("comments")
  })

  return Comments({DOM,props$})
}


function EntityInfos({DOM, props$}, name = '') {
  //comments$.subscribe(e=>console.log("Comments",e))
  /*intent({DOM}).changeName$.subscribe(e=>console.log("changeName",e))
  intent({DOM}).changeColor$.subscribe(e=>console.log("changeColor",e))*/

  const state$ = model(props$)

  const comments = CommentsWrapper(state$,DOM)

  const vtree$ = view(state$,comments.DOM)
  
  return {
    DOM: vtree$,
    events:{
      //selectionTransforms$
      //addComment$
    }
  }
}

export default EntityInfos