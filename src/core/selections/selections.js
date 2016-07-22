import { toArray, exists } from '../../utils/utils'
import { makeModel, mergeData } from '../../utils/modelUtils'

import { without, pluck, flatten } from 'ramda'


/*rules:
  - tap instance to select it, tap the same one to unselect it (basic multi select)
  - tap bom entry/part to select it, tap the same one to unselect it (basic multi select)

  - taping in 'empty space' unselects all

  - even a single selected instance selects the whole part (bom entry) (can only unselect bom entry if there are no more selected instances)
  - taping a bom entry selects all instances regardless of previous instance selections (override)

*/
function multiSelectionHelper(state, field, input){
  const {ids, override} = input
  const newSelections = toArray(ids)
  const existingSelections = state[field]

  const nSelect = new Set(newSelections)
  const oSelect = new Set(existingSelections)
  const union = new Set([...nSelect, ...oSelect])
  const intersection = new Set([...nSelect].filter(x => oSelect.has(x)))

  // intersections are the ones we do NOT want
  let newState = []
  if (newSelections.length !== 0) {
    newState = override ? newSelections : without([...intersection], [...union])
  }
  return newState
}

function selectedInstancesFromTypes (state, input, instances) {
  const selectedTypesByInstances = instances.reduce(function (acc, id) {
    if (input.idsMapper) {
      acc.push(input.idsMapper.typeUidFromInstUid[id])
    }
    return acc
  }, [])
  // selecting types based on instances
  return multiSelectionHelper(state, 'bomIds', {ids: selectedTypesByInstances, override: true})
}

function selectedTypesFromInstances (state, input, types) {
  const selectedInstancesByTypes = types.reduce(function (acc, id) {
    if (input.idsMapper) {
      acc.push(input.idsMapper.instUidFromTypeUid[id])
    }
    return acc
  }, [])
  // selecting instances based on types
  return multiSelectionHelper(state, 'bomIds', {ids: flatten(selectedInstancesByTypes), override: true})
}

function multiSelectionHelper2(state, input){
  let newInstancesBaseStates
  let newTypesBaseStates
  if(input.type === 'instances')
  {
    newInstancesBaseStates = state.multiSelect ? multiSelectionHelper(state, 'instIds', input) : input.ids
    const selectedTypesByInstances = newInstancesBaseStates.reduce(function (acc, id) {
      if (input.idsMapper) {
        acc.push(input.idsMapper.typeUidFromInstUid[id])
      }
      return acc
    }, [])

    // selecting types based on instances
    newTypesBaseStates = multiSelectionHelper(state, 'bomIds', {ids: selectedTypesByInstances, override: true})
  }
  if(input.type === 'types'){
    newTypesBaseStates = state.multiSelect ? multiSelectionHelper(state, 'bomIds', input) : input.ids
    const selectedInstancesByTypes = newTypesBaseStates.reduce(function (acc, id) {
      if (input.idsMapper) {
        const foo = input.idsMapper.instUidFromTypeUid[id]
        acc.push(foo)
      }
      return acc
    }, [])

    // selecting instances based on types
    newInstancesBaseStates = multiSelectionHelper(state, 'bomIds', {ids: flatten(selectedInstancesByTypes), override: true})
  }

  const instIds = newInstancesBaseStates ? newInstancesBaseStates.filter(exists) : state.instIds
  const bomIds = newTypesBaseStates ? newTypesBaseStates.filter(exists) : state.bomIds
  const multiSelect = state.multiSelect && instIds.length > 0

  const newState = {
    instIds,
    bomIds,
    multiSelect
  }

  return newState
}

function selectInstancesAndTypes (state, input) {
  const newState = multiSelectionHelper2(state, input)
  console.log('selected instances and types', newState)
  return mergeData(state, newState)
}

/*
function selectEntities (state, input) {
  console.info("selecting instances",input)
  const newState = multiSelectionHelper(state, 'instIds', input)
  console.log('selected instances', newState)
  return mergeData(state, {instIds: newState})
}

function selectBomEntries (state, input) {
  console.info("selecting types", input)
  const newState = multiSelectionHelper(state, 'bomIds', input)
  console.log('selected parts', newState)

  return mergeData(state, {bomIds: newState})
}*/

function removeInstances (state, input) {
  console.log('removeInstances from selections')
  const instIds = without(pluck('id')(input), state.instIds)
  const bomIds = selectedTypesFromInstances(state, input, instIds)

  return mergeData(state, {bomIds, instIds})
}

function removeTypes (state, input) {
  console.log('removeTypes from selections')
  const bomIds = without(pluck('id')(input), state.bomIds)
  const instIds = selectedInstancesFromTypes(state, input, bomIds)
  return mergeData(state, {bomIds, instIds})
}

function setMultiSelectMode (state, input) {
  console.log('setting multiSelect', input)
  return mergeData(state, {multiSelect: input})
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
    focusInstIds: [],
    multiSelect: false
  }

  let updateFns = {
    //selectEntities,
    //selectBomEntries,
    selectInstancesAndTypes,
    removeInstances,
    removeTypes,

    setMultiSelectMode,

    focusOnEntities
  }
  return makeModel(defaults, updateFns, actions)
}

export default selections
