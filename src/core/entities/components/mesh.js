import { removeComponents, duplicateComponents, makeActionsFromApiFns } from './common'
import { makeModel, mergeData } from '../../../utils/modelUtils'
import THREE from 'three'

// //Mesh//////
export function makeMeshSystem (actions) {
  const defaults = {
  }

  function createComponentsMesh (defaults, state, inputs) {
    // console.log('createComponents for mesh', inputs)

    return inputs.reduce(function (state, input) {
      let inputValue = {}
      if (input && input.value) {
        inputValue = input.value
      }

      let mesh = inputValue.mesh.clone()// meh ?//FIXME : make sure there are no multiple clones
      mesh.material = mesh.material.clone() // {mesh: inputValue.mesh }// mergeData(defaults,inputValue)
      let id = input.id

      mesh.userData.entity = {id}
      mesh.pickable = true

      state = mergeData({}, state)
      state[id] = mesh
      // FIXME big hack, use immutability !!!

      // console.log('done createComponents (mesh)', state)
      return state
    }, state)
  }

  function mirrorComponents (defaults, state, inputs) {
    return inputs.reduce(function (state, input) {
      let original = {}
      original = state[input.id]


      let mesh = original.clone()// meh ?//FIXME : make sure there are no multiple clones
      mesh.material = mesh.material.clone() // {mesh: inputValue.mesh }// mergeData(defaults,inputValue)
      let id = input.id

      mesh.userData.entity = {id}
      mesh.pickable = true

      //mesh.scale(-1, 1, 1)
      let mS = (new THREE.Matrix4()).identity()

      const conv =[0, 5, 10]
      //set -1 to the corresponding axis
      mS.elements[conv[input.axis]] = -1
      //mS.elements[0] = -1 // x
      //mS.elements[5] = -1; // y
      //mS.elements[10] = -1 // z

      mesh.geometry.applyMatrix(mS)
      //flip things
      mesh.geometry.dynamic = true
      mesh.geometry.attributes.position.needsUpdate = true

      var p = mesh.geometry.attributes.normal.array
      for(var i =0; i<p.length; i++){
        p[i] = -p[i]
      }
      if (mesh.material.side === 0) {
        mesh.material.side = THREE.BackSide
      }
      else {
        mesh.material.side = 0
      }

      console.log('mirrorComponents', state, input)

      state = mergeData({}, state)
      state[id] = mesh
      // FIXME big hack, use immutability !!!

      return state
    }, state)
  }

  // TODO: should defaults be something like a stand in cube ?
  let updateFns = {
    createComponents: createComponentsMesh.bind(null, undefined),
    mirrorComponents: mirrorComponents.bind(null, undefined),
    duplicateComponents,
    removeComponents
  }

  if (!actions) {
    actions = makeActionsFromApiFns(updateFns)
  }

  let meshes$ = makeModel(defaults, updateFns, actions, undefined, {doApplyTransform: false}) // last flag set to false because we
  // do not want immutable data for meshes ?

  return {
    meshes$,
    meshActions: actions
  }
}
