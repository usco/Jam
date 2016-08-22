import { pluck, head } from 'ramda'

import { createComponents, removeComponents, duplicateComponents, makeActionsFromApiFns } from './common'
import { makeModel, mergeData } from '../../../utils/modelUtils'
// //Transforms//////

function applySnapping (transformValues, stepSize, mapValue = undefined) {
  // applies snapping for both rotation and scaling
  // maps the rotationtransformValues from to degrees and back
  let numberToRoundTo = 1 / stepSize
  for (let i = 0; i < transformValues.length; i++) {
    let roundedNumber = transformValues[i]
    roundedNumber = mapValue ? roundedNumber * (180 / Math.PI) : roundedNumber
    roundedNumber = Math.round(roundedNumber * numberToRoundTo) / numberToRoundTo
    if (mapValue) { roundedNumber = roundedNumber * (Math.PI / 180) }
    transformValues[i] = roundedNumber
  }
  return transformValues
}

function applyUniformScaling (transformDefaults, transformValues) {
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

function applySnapAndUniformScaling (transformDefaults, transformationType, transformation, settings) {
  const snapDefaults = {
    pos: 0.1, // snap translation snaps to 0.1 units
    rot: 10, // snap rotation snaps to tens of degrees
    sca: 0.1 // snap scaling snaps to tens of percentages
  }
  //console.log('applySnapAndUniformScaling', transformation)
  let {uniformScaling, snapScaling, snapRotation, snapTranslation} = settings

  if (uniformScaling && transformationType === 'sca') { transformation = applyUniformScaling(transformDefaults, transformation) }
  if (snapScaling && transformationType === 'sca') { transformation = applySnapping(transformation, snapDefaults[transformationType]) }
  if (snapTranslation && transformationType === 'pos') { transformation = applySnapping(transformation, snapDefaults[transformationType]) }
  if (snapRotation && transformationType === 'rot') { transformation = applySnapping(transformation, snapDefaults[transformationType], (2 * Math.PI)) }
  return transformation
}



export function mirrorComponents (transformDefaults, state, inputs) {
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

export function resetScalingComponents (state, inputs) {
  console.log('it does somethin', state)
  console.log('it does somethin', inputs)

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


export function updateComponents (transformDefaults, state, inputs) {
  const currentStateFlat = inputs.map((input) => state[input.id])

  const transform = head(inputs)['trans']
  const currentAvg = pluck(transform)(currentStateFlat)
    .reduce(function (acc, cur) {
      if (!acc) return cur
      return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
    }, undefined)

  return inputs.reduce(function (state, input) {
    state = mergeData({}, state)
    let {id} = input

    const diff = [input.value[0] - currentAvg[0], input.value[1] - currentAvg[1], input.value[2] - currentAvg[2]]

    const transformation = diff.map(function (value, index) {
      return state[id][input.trans][index] + value
    }) || transformDefaults

    state[id][input.trans] = applySnapAndUniformScaling(transformDefaults, input.trans, transformation, input.settings)
    //console.log('state', state, input)
    return state
  }, state)
}

export function makeTransformsSystem (actions) {
  const defaults = {}

  const transformDefaults = {
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
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

  let updateFns = {
    updateRotation,
    updatePosition,
    updateScale,
    resetScalingComponents: resetScalingComponents.bind(null, transformDefaults),
    mirrorComponents: mirrorComponents.bind(null, transformDefaults),
    updateComponents: updateComponents.bind(null, transformDefaults),
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
