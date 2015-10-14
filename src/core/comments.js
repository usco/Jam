import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import logger from '../utils/log'
let log = logger("comments")
log.setLevel("info")

import {toArray, generateUUID} from '../utils/utils'
import {makeModelNoHistory, mergeData} from '../utils/modelUtils'

//"comments" system

//comments[key]= "some quite long text, with markdown support "

function addComments(state, input){

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

function comments(actions, source){
  ///defaults, what else ?
  const defaults = {
    data:[
       /*{text:"bla bla details",author:"foo"},
       {text:"oh yes cool ",author:"bar"},*/
    ]
    ,bykey:{
    }
  }

  let updateFns  = {addComments}
  return makeModelNoHistory(defaults, updateFns, actions, source)
}

export default comments