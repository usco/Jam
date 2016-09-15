import { pluck, head, assocPath } from 'ramda'
import { createComponents, removeComponents, duplicateComponents, makeActionsFromApiFns } from './common'
import { makeModel } from '../../../utils/modelUtils'


//FIXME: is bounds a "fake"/ computed piece of state: ie
// mesh + scale => bounds , the other way around you are not actually manipulating the bounds, just telling
// some other system that you want to change the scale/mesh ?

export function updateComponents (state, inputs) {
    console.log('bounds: updateComponents', state, inputs)
  //TODO: THIS IS NOT UPDATING STATE ON PURPOSE !!! do not change for now!!
  return state
  const currentStateFlat = inputs.map((input) => state[input.id])

  const field = 'size'// what field do we want to update?
  const currentAvg = pluck(field)(currentStateFlat) //we compute the current average (multi selection)
    .reduce(function (acc, cur) {
      if (!acc) return cur
      return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
    }, undefined)

  return inputs.reduce(function (state, input) {
    let {id} = input

    //compute the diff between new average and old average
    const diff = [input.value[0] - currentAvg[0], input.value[1] - currentAvg[1], input.value[2] - currentAvg[2]]

    //generate actual transformation
    const updatedField = diff.map(function (value, index) {
      return state[id][field][index] + value
    }) //|| transformDefaults

    //console.log('updatedTransformation', updatedTransformation)
    //return updated state
    return assocPath([id, field], updatedField, state)
  }, state)
}

// //BoundingBox//////
export function makeBoundingSystem (actions) {
  const defaults = {}

  const boundsDefaults = {
    min: [0, 0, 0],
    max: [0, 0, 0],
    size: [0, 0, 0],
    dia: 0,
    center: [0, 0, 0]
  }

  let updateFns = {
    createComponents: createComponents.bind(null, boundsDefaults),
    updateComponents,
    duplicateComponents,
    removeComponents
  }

  if (!actions) {
    actions = makeActionsFromApiFns(updateFns)
  }

  let bounds$ = makeModel(defaults, updateFns, actions)

  return {
    bounds$,
    boundActions: actions
  }
}
