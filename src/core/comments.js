import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import logger from '../utils/log'
let log = logger("comments")
log.setLevel("info")

import {toArray, generateUUID} from '../utils/utils'
import {makeModel, mergeData} from '../utils/modelUtils'

//"comments" system
//helper function to get data by key
/*
function bykey(key){
  return comments.data.filter(function(e){
    let equal = equals(e.key , key)
    return equal
  })
}*/

function addComments(state, input){
  log.info("adding comments", input)
  let newComments = toArray(input)

  const comments = state.data.concat(
      newComments.map(function(comment){
        let {id,typeUid} = comment.target
        let text           = comment.text 
        let author         = "jon doe"  //FIXME: how to deal with authors ? 

        let key = [id,typeUid]
        let entry = {text, author, key}
        return entry
      })
    )
  const updatedState = {
    data:comments
  }
  return updatedState
}

function comments(actions, source){
  ///defaults, what else ?
  const defaults = {
    data:[
       /*{text:"bla bla details",author:"foo"},
       {text:"oh yes cool ",author:"bar"},*/
    ]
  }

  let updateFns  = {addComments}
  return makeModel(defaults, updateFns, actions, source, {doApplyTransform:true})
}

export default comments