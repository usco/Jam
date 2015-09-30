import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import logger from '../../utils/log'
let log = logger("comments")
log.setLevel("info")

import {toArray, generateUUID} from '../../utils/utils'
import {mergeData} from '../../utils/modelUtils'

//"comments" system
const defaults = {
  data:[
     /*{text:"bla bla details",author:"foo"},
     {text:"oh yes cool ",author:"bar"},*/
  ]
  ,bykey:{

  }
}
//comments[key]= "some quite long text, with markdown support "

function addComments(state, {input,settings}){

  log.info("adding comments", input)

  let {data,bykey} = state
  let newComments = toArray(input)
  let updatedData = mergeData({},state)

  newComments.map(function(comment){
    let {iuid,typeUid} = comment.target
    let text = comment.text 

    let key = [iuid,typeUid]
    
    //FIXME: how to deal with authors ? 
    let entry = {text, author:"jon doe", key}
    if(!updatedData.bykey[key]){
      updatedData.bykey[key] = [] //we need LISTS of comments
    }

    updatedData.bykey[key].push( entry )
    updatedData.data.push( entry )
  })
  return updatedData

}

function makeModification(intent){
  /*add comments*/
  let addComments$ = intent.addComments$
    .withLatestFrom(intent.settings$,function(newData,settings){
      return {newData, settings}
    })
    .map(({newData,settings}) => (existingData) => {
      addComments(existingData,{input:newData,settings})
    })
  
  return merge(
    addComments$
  )
}


function comments(intent, source) {
  let source$ = source || Observable.just(defaults)
  let modification$ = makeModification(intent)

  return modification$
    .merge(source$)
    .scan((existingData, modFn) => modFn(existingData))//combine existing data with new one
    //.distinctUntilChanged()
    .shareReplay(1)
}

export default comments