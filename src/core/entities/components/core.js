import {Rx} from '@cycle/core'
import {createComponent,removeComponent,makeActionsFromApiFns} from './common'
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

  let updateFns = {
    setAttribs
    , clone
    , createComponent: createComponent.bind(null,componentDefaults)
    , removeComponent}

  if(!actions){
    actions   = makeActionsFromApiFns(updateFns)
  }

  let core$ = makeModelNoHistory(defaults, updateFns, actions)

  return {core$,coreActions:actions}
}
