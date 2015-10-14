import {Rx} from '@cycle/core'
import {makeModelNoHistory, mergeData} from '../../../utils/modelUtils'
import {generateUUID} from '../../../utils/utils'
import {combineLatestObj} from '../../../utils/obsUtils'
let just = Rx.Observable.just

//possible helpers
function addEntity(inputs){

}

function deleteEntity(id){
  return actions.map(function(action){
    action.removeComponent$.onNext({id})
  })
}

function duplicateEntity(id){
  return actions.map(function(action){
    action.cloneComponent$.onNext({id})
  })
}

/////////
//used for all
export function createComponent(defaults,state,input){
  console.log("createComponent",defaults)
  let inputValue =  {}
  if(input && input.value) inputValue = input.value
  const newAttrs = mergeData(defaults,inputValue)

  //auto increment ?
  //auto generate ?
  let id = generateUUID()
  if(input && input.id) id = input.id

  state = mergeData({},state)
  state[id] = newAttrs
  //FIXME big hack, use mutability
  return state 
}

export function removeComponent(state,input){
  console.log("removeComponent")
  let {id} = input

  state = mergeData({},state)
  //FIXME big hack, use mutability
  delete state[id]
  return state 
}

export function duplicateComponent(state,input){
  console.log("duplicateEntity")
  let {id,newId} = input

  let clone = mergeData({},state[id]) 

  state = mergeData({},state)
  //FIXME big hack, use mutability
  state[newId] = clone
  return state 
}

//other helpers
export function makeActionsFromApiFns(apiFns){

  const actions = Object.keys(apiFns)
    .reduce(function(prev,cur){
      let key = cur+'$'
      prev[key] = new Rx.Subject()
      return prev
    },{})

   return actions
}

