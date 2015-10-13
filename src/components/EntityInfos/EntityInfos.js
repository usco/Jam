/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from 'classnames'
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest

import {combineLatestObj, preventDefault,isTextNotEmpty,formatData,exists} from '../../utils/obsUtils'

import Comments from '../Comments/Comments'
import view from './view'
import intent from './intent'

////////

function model(props$, actions){
  let comments$   = props$.pluck('comments').filter(exists).startWith(undefined)
  let core$       = props$.pluck('core').filter(exists).startWith(undefined)
  let transforms$ = props$.pluck('transforms').filter(exists).startWith(undefined)

  return combineLatestObj({core$, transforms$, comments$})
}

//err bad naming ..also should this be part of the model 
function refineActions(props$, actions){
  const transforms$ = props$.pluck('transforms')
    .filter(exists)
    .map(e=>e[0])

  const changeTransforms$ = actions.changeTransforms$
    .withLatestFrom(transforms$,function(changed,transforms){
      //let bla = Object.assign({},transforms) // this does not create a new instance huh ????
      let output = JSON.parse(JSON.stringify(transforms))
      output[changed.trans][changed.idx] = changed.val
      return output
  })
  return {
    changeCore$:actions.changeCore$
    , changeTransforms$
  }
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
  const state$ = model(props$)

  const comments = CommentsWrapper(state$,DOM)

  const {changeCore$, changeTransforms$} = refineActions( props$, intent(DOM) )

  const vtree$ = view(state$, comments.DOM)
  
  return {
    DOM: vtree$,
    events:{
      changeCore$
      ,changeTransforms$
      //addComment$
    }
  }
}

export default EntityInfos