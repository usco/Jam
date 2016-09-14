import { pluck, head, assocPath } from 'ramda'

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

//mirror on given axis
export function mirrorComponents (transformDefaults, state, inputs) {
  return inputs.reduce(function (state, input) {
    let updatedScale = Object.assign([], transformDefaults.sca, state[input.id].sca)
    updatedScale[input.axis] *= -1 // mirroring is just inverting scale on the given axis

    return assocPath([input.id, 'sca'], updatedScale, state) // return updated state
  }, state)
}

//reset scaling to default
export function resetScaling (transformDefaults, state, inputs) {
  return inputs.reduce(function (state, input) {
    const updatedScale = Object.assign([], transformDefaults.sca)
    return assocPath([input.id, 'sca'], updatedScale, state) // return updated state
  }, state)
}

// update any transform component (pos, rot, scale) does NOT mutate the original state
export function updateComponents (transformDefaults, state, inputs) {
  const currentStateFlat = inputs.map((input) => state[input.id])

  const transform = head(inputs)['trans']// what transform do we want to update?
  const currentAvg = pluck(transform)(currentStateFlat) // we compute the current average (multi selection)
    .reduce(function (acc, cur) {
      if (!acc) return cur
      return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
    }, undefined)

  return inputs.reduce(function (state, input) {
    state = mergeData({}, state)
    let {id, value, trans, settings} = input

    //compute the diff between new average and old average
    const diff = [value[0] - currentAvg[0], value[1] - currentAvg[1], value[2] - currentAvg[2]]

    //generate actual transformation
    const transformation = diff.map(function (value, index) {
      return state[id][trans][index] + value
    }) || transformDefaults

    //apply any limits, snapping etc
    const updatedTransformation = applySnapAndUniformScaling(transformDefaults, trans, transformation, settings)
    //return updated state
    return assocPath([id, trans], updatedTransformation, state)
  }, state)
}

export function makeTransformsSystem (actions) {
  const defaults = {}

  const transformDefaults = {
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
  }

  const updateFns = {
    resetScaling: resetScaling.bind(null, transformDefaults),
    mirrorComponents: mirrorComponents.bind(null, transformDefaults),
    updateComponents: updateComponents.bind(null, transformDefaults),
    createComponents: createComponents.bind(null, transformDefaults),
    duplicateComponents,
    removeComponents
  }

  actions = actions || makeActionsFromApiFns(updateFns)

  let transforms$ = makeModel(defaults, updateFns, actions)

  return {
    transforms$,
    transformActions: actions
  }
}
