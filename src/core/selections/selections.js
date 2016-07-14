import { toArray } from '../../utils/utils'
import { makeModel, mergeData } from '../../utils/modelUtils'

import {without} from 'ramda'

function multiSelectionHelper(state, input){
  const newSelections = toArray(input)
  const existingSelections = state

  const nSelect = new Set(newSelections)
  const oSelect = new Set(existingSelections)
  const union = new Set([...nSelect, ...oSelect])
  const intersection = new Set([...nSelect].filter(x => oSelect.has(x)))

  //intersections are the ones we do NOT want
  const newState = newSelections.length === 0 ? [] : without([...intersection], [...union])
  return newState
}

function selectEntities (state, input) {
  // console.info("selecting entitites",input)
  const newState = multiSelectionHelper(state.instIds, input)
  console.log('selected instances', newState)
  return mergeData(state, {instIds: newState})
}

function selectBomEntries (state, input) {
  // log.info("selecting types",sBomIds)
  const newState = multiSelectionHelper(state.bomIds, input)
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
