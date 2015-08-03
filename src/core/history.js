import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import logger from '../utils/log'
let log = logger("comments")
log.setLevel("info")

import {generateUUID} from 'usco-kernel2/src/utils'
import {toArray} from '../utils/utils'

//"comments" system
const defaults = {
}

function makeModification(){
  /*add comments*/
  let undo$ = intent.undo$
    .withLatestFrom(intent.settings$,function(newData,settings){
      return {settings}
    })
    .map(({settings}) => (existingData) => {
      log.info("undoing", newData)
       
      return updatedData
    })
  
  return merge(
    addComments$
  )
}

function history(intent, source) {
  let source$ = source || Observable.just(defaults)
  let modification$ = makeModification(intent)

  return modification$
    .merge(source$)
    .scan((existingData, modFn) => modFn(existingData))//combine existing data with new one
    //.distinctUntilChanged()
    .shareReplay(1)
}

export default history