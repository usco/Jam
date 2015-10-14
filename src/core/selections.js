import Rx from 'rx'
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import {toArray} from '../utils/utils'
import {makeModelNoHistory, mergeData} from '../utils/modelUtils'


function selectEntities(state, input){
  //log.info("selecting entitites",sentities)
  let entityIds = toArray(input)

  state.instIds = entityIds
  return state
}

function selectBomEntries(state, input){
  //log.info("selecting bom entries",sBomIds)
  let bomIds = toArray(input)

  state.bomIds = bomIds
  return state
}

function selections(actions, source){
  ///defaults, what else ?
  const defaults = {
    instIds:[]
    ,bomIds:[]
  }

  let updateFns  = {selectEntities,selectBomEntries}
  return makeModelNoHistory(defaults, updateFns, actions)
}

export default selections