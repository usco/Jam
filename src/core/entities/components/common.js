import Rx from 'rx'
import {makeModel, mergeData} from '../../../utils/modelUtils'
import {generateUUID} from '../../../utils/utils'
import {combineLatestObj} from '../../../utils/obsUtils'
let just = Rx.Observable.just
import {isEmpty} from 'ramda'



/////////
//used for all
export function createComponents(defaults, state, inputs){
  console.log("createComponents",inputs)

  return inputs.reduce(function(state,input){

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

    console.log("done createComponents",state)
    return state 

  },state)

 
}

export function removeComponents(state, inputs){
  console.log("removeComponents",inputs)

  return inputs.reduce(function(state,selection){   
    state = mergeData({},state)
    //FIXME big hack, use mutability
    delete state[selection.id]
    return state 
  },state)


}

export function duplicateComponents(state, inputs){
  console.log("duplicatING Components",inputs)

  return inputs.reduce(function(state,input){
    let {id,newId} = input

    const source = state[id]
    let   clone  = undefined
    if('clone' in source){
      clone = source.clone()
      //FIXME specific to mesh components, move it elsewhere
      clone.material=source.material.clone()
      clone.userData.entity = {
        id:newId
      }
      clone.pickable = source.pickable

    }else{
      clone = mergeData({},source) 
      clone.id = newId
    }

    state = mergeData({},state)
    //FIXME big hack, use mutability
    state[newId] = clone

    console.log("done duplicateComponents",state)
    return state 
  },state)
  
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

