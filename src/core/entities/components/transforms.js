import {Rx} from '@cycle/core'
import {createComponent,removeComponent,makeActionsFromApiFns} from './common'
import {makeModelNoHistory, mergeData} from '../../../utils/modelUtils'

////Transforms//////

export function makeTransformsSystem(actions){
  const defaults = {}

  const transformDefaults ={
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
  }

  function updatePosition(state, input){
    console.log("updatePosition")
    let id  = input.id
    let pos = input.value  || [0,0,Math.random()]
    let orig = state[id] || transformDefaults

    state = mergeData({},state)
    //FIXME big hack, use mutability
    state[id] = mergeData({},orig,{pos})
    return state
  }

  function updateRotation(state, input){
    console.log("updateRotation")
    let {id} = input
    let rot = input.value || [0,0,Math.random()]
    let orig = state[id] || transformDefaults

    state = mergeData({},state)
    //FIXME big hack, use mutability
    state[id] = mergeData({},orig,{rot})
    return state
  }

  function updateScale(state, input){
    console.log("updateScale")
    let {id} = input
    let sca = input.value || [1,1,Math.random()]
    let orig = state[id] || transformDefaults

    state = mergeData({},state)
    //FIXME big hack, use mutability
    state[id] = mergeData({},orig,{sca})
    return state
  }

  function updateTransforms(state, input){
    //console.log("updateTransforms", input.id)
    state = mergeData({},state)

    let {id} = input
    let transforms = input.value || transformDefaults
    
    //FIXME big hack, use mutability
    state[id] = transforms
    return state
  }

  let updateFns = { updateRotation, updatePosition, updateScale, updateTransforms
    , createComponent: createComponent.bind(null,transformDefaults)
    , removeComponent }

  if(!actions){
    actions   = makeActionsFromApiFns(updateFns)
  }

  let transforms$ = makeModelNoHistory(defaults, updateFns, actions)

  return {transforms$,transformActions:actions}
}