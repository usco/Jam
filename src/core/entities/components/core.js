import {Rx} from '@cycle/core'
import {createComponents,removeComponents,makeActionsFromApiFns} from './common'
import {makeModelNoHistory, mergeData} from '../../../utils/modelUtils'

////Entity Core//////
export function makeCoreSystem(actions){
  const defaults = {}

  //defaults for each component in this system
  const componentDefaults ={
    name: undefined,
    id:   undefined,
    typeUid: undefined,
    color: "#07a9ff"
  }

  function setAttribs(state, input){
    let id  = input.id

    let newAttrs = input.value
    let orig = state[id]

    state = mergeData({},state)
    //FIXME big hack, use mutability
    state[id] = mergeData(orig,newAttrs)
    return state
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
    console.log("clearing core")
    return {}
  }

  let updateFns = {
    setAttribs
    //, clone
    , createComponents: createComponents.bind(null,componentDefaults)
    , removeComponents
    , clear
  }

  if(!actions){
    actions   = makeActionsFromApiFns(updateFns)
  }

  let core$ = makeModelNoHistory(defaults, updateFns, actions)

  return {core$,coreActions:actions}
}
