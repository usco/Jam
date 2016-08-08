import { createComponents, removeComponents, duplicateComponents, makeActionsFromApiFns } from './common'
import { makeModel } from '../../../utils/modelUtils'

export function updateComponents (state, inputs) {
  console.log('bounds: updateComponents')
  return state
}

// //BoundingBox//////
export function makeBoundingSystem (actions) {
  const defaults = {}

  const boundsDefaults = {
    min: [0, 0, 0],
    max: [0, 0, 0],
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
