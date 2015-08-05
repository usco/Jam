import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import logger from '../../utils/log'
let log = logger("comments")
log.setLevel("info")

import {generateUUID} from 'usco-kernel2/src/utils'
import {toArray} from '../../utils/utils'

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

function makeModification(intent){
  /*add comments*/
  let addComments$ = intent.addComments$
    .withLatestFrom(intent.settings$,function(newData,settings){
      return {newData, settings}
    })
    .map(({newData,settings}) => (existingData) => {
      log.info("adding comments", newData)

      let {data,bykey} = existingData
      let newComments = toArray(newData)
      let updatedData = Object.assign({},existingData)

      newComments.map(function(comment){
        let {iuid,typeUid} = comment.target
        let text = comment.text 

        let key = [iuid,typeUid] /*{iUid:"xx",tUid:"xx", toString(){
          iUid+tUid
        }}*/
        
        //FIXME: how to deal with authors ? 

        let entry = {text, author:"jon doe", key}
        if(!updatedData.bykey[key])
          updatedData.bykey[key] = [] //we need LISTS of comments

        updatedData.bykey[key].push( entry )
        updatedData.data.push( entry )
      })
      return updatedData
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