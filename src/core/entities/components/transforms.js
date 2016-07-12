import {pluck} from 'ramda'

import { createComponents, removeComponents, duplicateComponents, makeActionsFromApiFns } from './common'
import { makeModel, mergeData } from '../../../utils/modelUtils'
// //Transforms//////

export function makeTransformsSystem (actions) {
  const defaults = {}

  const transformDefaults = {
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
  }
  const snapDefaults = {
    pos: 0.1, // snap translation snaps to 0.1 units
    rot: 10, // snap rotation snaps to tens of degrees
    sca: 0.1 // snap scaling snaps to tens of percentages
  }

  function updatePosition (state, input) {
    console.log('updatePosition')
    let id = input.id
    let pos = input.value || [0, 0, Math.random()]
    let orig = state[id] || transformDefaults

    state = mergeData({}, state)
    // FIXME big hack, use mutability
    state[id] = mergeData({}, orig, {pos})
    return state
  }

  function updateRotation (state, input) {
    console.log('updateRotation')
    let {id} = input
    let rot = input.value || [0, 0, Math.random()]
    let orig = state[id] || transformDefaults

    state = mergeData({}, state)
    // FIXME big hack, use mutability
    state[id] = mergeData({}, orig, {rot})
    return state
  }

  function updateScale (state, input) {
    console.log('updateScale')
    let {id} = input
    let sca = input.value || [1, 1, Math.random()]
    let orig = state[id] || transformDefaults

    state = mergeData({}, state)
    // FIXME big hack, use mutability
    state[id] = mergeData({}, orig, {sca})
    return state
  }

  function mirrorComponents (state, inputs) {
    console.log('mirroring transforms', inputs)

    return inputs.reduce(function (state, input) {
      let {id} = input

      let sca = state[id].sca.map(d => d) // DO NOT REMOVE ! a lot of code relies on diffing, and if you mutate the original scale, it breaks !
      sca[input.axis] *= -1

      let orig = state[id] || transformDefaults

      state = mergeData({}, state)
      // FIXME big hack, use mutability
      state[id] = mergeData({}, orig, {sca})

      return state
    }, state)
  }

  function applySnapping (transformValues, stepSize, mapValue = undefined) {
    // applies snapping for both rotation and scaling
    // maps the rotationtransformValues from tau (2 * pi) to degrees and back
    let numberToRoundTo = 1 / stepSize
    for (let i = 0; i < transformValues.length; i++) {
      if (mapValue) { transformValues[i] = transformValues[i] * 360 / mapValue }
      let roundedNumber = Math.round(transformValues[i] * numberToRoundTo) / numberToRoundTo
      if (mapValue) { roundedNumber = roundedNumber / 360 * mapValue }
      transformValues[i] = roundedNumber
    }
    return transformValues
  }

  function applyUniformScaling (transformValues) {
    // sorts the values and sees which is different, because this is the changes
    // then applies the new value to all dimension in respect to the minussign because this is added by mirroring
    let sortedValues = JSON.parse(JSON.stringify(transformValues)) // deepcopy
    sortedValues.forEach(function (part, i) {
      if (sortedValues[i].isNaN) { transformValues = sortedValues = transformDefaults.sca } // safety catch
      sortedValues[i] = Math.abs(part)
    })
    sortedValues = sortedValues.slice().sort()
    for (let i = 0; i < sortedValues.length; i++) {
      if (sortedValues[i] === sortedValues[i + 1]) {
        sortedValues.splice(i, 2)
      }
    }
    let newValue = sortedValues[0]
    for (let i = 0; i < transformValues.length; i++) {
      if (transformValues[i] < 0) {
        transformValues[i] = -(newValue)
      } else {
        transformValues[i] = newValue
      }
    }
    return transformValues
  }

  function applySnapStates (id, transformation, settings) {
    console.log('applySnapStates', transformation)
    let {uniformScaling, snapScaling, snapRotation, snapTranslation} = settings

    if (uniformScaling) { transformation.sca = applyUniformScaling(transformation.sca) }
    if (snapScaling) { transformation.sca = applySnapping(transformation.sca, snapDefaults.sca) }
    if (snapTranslation) { transformation.pos = applySnapping(transformation.pos, snapDefaults.pos) }
    if (snapRotation) { transformation.rot = applySnapping(transformation.rot, snapDefaults.rot, (2 * Math.PI)) }

    return transformation
  }

  function updateComponents (state, inputs) {
    /*console.log('updating transforms', inputs)
    const currentAvg = pluck('pos')(transforms)
      .reduce(function (acc, cur) {
        if(!acc) return cur
        return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
      }, undefined)*/

    return inputs.reduce(function (state, input) {

      state = mergeData({}, state)
      let {id} = input
      let transformation = input.value || transformDefaults
      state[id] = applySnapStates(input.id, transformation, input.settings)
      //state[id]['pos'] = [ state[id]['pos'][0] +input.value[0], state[id]['pos'][1] +input.value[1], state[id]['pos'][2] +input.value[2]]
      //console.log('updating data of component', id)
      return state
    }, state)
  }

  let updateFns = {
    updateRotation,
    updatePosition,
    updateScale,
    mirrorComponents,
    updateComponents,
    createComponents: createComponents.bind(null, transformDefaults),
    duplicateComponents,
    removeComponents
  }

  if (!actions) {
    actions = makeActionsFromApiFns(updateFns)
  }

  let transforms$ = makeModel(defaults, updateFns, actions)

  return {
    transforms$,
    transformActions: actions
  }
}
