import {Rx} from '@cycle/core'
import {createComponents,removeComponents,makeActionsFromApiFns} from './common'
import {makeModelNoHistory, mergeData} from '../../../utils/modelUtils'


////Mesh//////
export function makeMeshSystem(actions){
  const defaults ={
  }

  function createComponentsMesh(defaults, state, inputs){
    console.log("createComponents for mesh", inputs)

    return inputs.reduce(function(state,input){
      let inputValue =  {}
      if(input && input.value) inputValue = input.value

      let newAttrs = inputValue.mesh //{mesh: inputValue.mesh }// mergeData(defaults,inputValue)

      //auto increment ?
      //auto generate ?
      //let id = generateUUID()
      //if(input && input.id) id = input.id
      let id = input.id

      state = mergeData({},state)
      state[id] = newAttrs
      //FIXME big hack, use mutability
      return state 
    },state)

  }

  //TODO: should defaults be something like a stand in cube ?
  let updateFns = {
    createComponents: createComponentsMesh.bind(null,undefined)
    , removeComponents}
  
  if(!actions){
    actions   = makeActionsFromApiFns(updateFns)
  }

  let meshes$ = makeModelNoHistory(defaults, updateFns, actions, undefined, false)//last flag set to false because we
  //do not want immutable data for meshes ?

  return {meshes$,meshActions:actions}
}