import Rx from 'rx'
import {createComponents,removeComponents,duplicateComponents,makeActionsFromApiFns} from './common'
import {makeModel, mergeData} from '../../../utils/modelUtils'

////Entity Meta//////
export function makeMetaSystem(actions){
  const defaults = {}

  //defaults for each component in this system
  const componentDefaults ={
    name: undefined,
    id:   undefined,
    typeUid: undefined,
    color: "#07a9ff"
  }

  function updateComponents(state, inputs){
    console.log("update meta attributes",inputs)//, metaChanges, instIds)

    return inputs.reduce(function(state,input){
      let id  = input.id

      let newAttrs = input.value
      let orig = state[id]

      state = mergeData({},state)
      //FIXME big hack, use mutability
      state[id] = mergeData(orig,newAttrs)
      return state
    },state)
    
  }

  function clone(state, input){
    let id  = input.id

    let newId = input.value
    let orig = state[id]

    let cloneInst = mergeData({},orig)
    cloneInst.id = newId

    state = mergeData({},state)
    //FIXME big hack, use mutability
    state[newId] = cloneInst

    return state
  }

  function clear(state, input){
    console.log("clearing meta")
    return {}
  }

  let updateFns = {
    updateComponents
    //, clone
    , createComponents: createComponents.bind(null,componentDefaults)
    , duplicateComponents
    , removeComponents
    , clear
  }

  if(!actions){
    actions   = makeActionsFromApiFns(updateFns)
  }

  let meta$ = makeModel(defaults, updateFns, actions)

  return {meta$,metaActions:actions}
}
