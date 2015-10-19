import {Rx} from '@cycle/core'
import {createComponent,removeComponent,makeActionsFromApiFns} from './common'
import {makeModelNoHistory, mergeData} from '../../../utils/modelUtils'


////Mesh//////
export function makeMeshSystem(){
  const defaults ={
  }

  function createComponentMesh(defaults,state,input){
    console.log("createComponent", input)
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
  }

  //TODO: should defaults be something like a stand in cube ?
  let updateFns = {
    createComponent: createComponentMesh.bind(null,undefined)
    , removeComponent}
  let actions   = makeActionsFromApiFns(updateFns)

  let meshes$ = makeModelNoHistory(defaults, updateFns, actions, undefined, false)//last flag set to false because we
  //do not want immutable data for meshes ?

  return {meshes$,meshActions:actions}
}