import Rx from 'rx'
import {createComponents,removeComponents,duplicateComponents,makeActionsFromApiFns} from './common'
import {makeModel, mergeData} from '../../../utils/modelUtils'


////Mesh//////
export function makeMeshSystem(actions){
  const defaults ={
  }

  function createComponentsMesh(defaults, state, inputs){
    //console.log("createComponents for mesh", inputs)

    return inputs.reduce(function(state,input){
      let inputValue =  {}
      if(input && input.value) inputValue = input.value

      let mesh = inputValue.mesh //{mesh: inputValue.mesh }// mergeData(defaults,inputValue)
      let id = input.id

      mesh.userData.entity = {id}
      mesh.pickable = true

      state = mergeData({},state)
      state[id] = mesh
      //FIXME big hack, use mutability

      //console.log("done createComponents (mesh)", state)
      return state 
    },state)

  }

  //TODO: should defaults be something like a stand in cube ?
  let updateFns = {
    createComponents: createComponentsMesh.bind(null,undefined)
    , duplicateComponents
    , removeComponents
  }
  
  if(!actions){
    actions   = makeActionsFromApiFns(updateFns)
  }

  let meshes$ = makeModel(defaults, updateFns, actions, undefined, {doApplyTransform:false})//last flag set to false because we
  //do not want immutable data for meshes ?

  return {meshes$,meshActions:actions}
}