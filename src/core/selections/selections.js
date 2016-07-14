import { toArray } from '../../utils/utils'
import { makeModel, mergeData } from '../../utils/modelUtils'

import { without, pluck } from 'ramda'


/*rules:
  - tap instance to select it, tap the same one to unselect it (basic multi select)
  - tap bom entry/part to select it, tap the same one to unselect it (basic multi select)

  - taping in 'empty space' unselects all

  - even a single selected instance selects the whole part (bom entry) (can only unselect bom entry if there are no more selected instances)
  - taping a bom entry selects all instances regardless of previous instance selections (override)

*/
function multiSelectionHelper(state, input, fullState){
  const {ids, override} = input
  const newSelections = toArray(ids)
  const existingSelections = state

  const nSelect = new Set(newSelections)
  const oSelect = new Set(existingSelections)
  const union = new Set([...nSelect, ...oSelect])
  const intersection = new Set([...nSelect].filter(x => oSelect.has(x)))

  //intersections are the ones we do NOT want
  let newState = []
  if(newSelections.length !== 0){
    if(override){
      newState = newSelections
    }else{
      newState = without([...intersection], [...union])
    }
  }
  //const newState = newSelections.length === 0 ? [] : without([...intersection], [...union])
  return newState
}

function selectEntities (state, input) {
  console.info("selecting instances",input)
  const newState = multiSelectionHelper(state.instIds, input, state)
  console.log('selected instances', newState)
  return mergeData(state, {instIds: newState})
}

function selectBomEntries (state, input) {
  console.info("selecting types", input)
  const newState = multiSelectionHelper(state.bomIds, input, state)
  console.log('selected parts', newState)

  return mergeData(state, {bomIds: newState})
}

function focusOnEntities (state, input) {
  //console.info('focusing on entitites', input)
  return mergeData(state, {focusInstIds: toArray(input)})
}

function selections (actions, source) {
  const defaults = {
    instIds: [],
    bomIds: [],
    // for focusing (!== selection)
    focusInstIds: []
  }

  let updateFns = {
    selectEntities,
    selectBomEntries,
  focusOnEntities}
  return makeModel(defaults, updateFns, actions)
}

export default selections
