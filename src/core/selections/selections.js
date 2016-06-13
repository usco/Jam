import { toArray } from '../../utils/utils'
import { makeModel, mergeData } from '../../utils/modelUtils'

function selectEntities (state, input) {
  // log.info("selecting entitites",input)
  return mergeData(state, {instIds: toArray(input)})
}

function selectBomEntries (state, input) {
  // log.info("selecting types",sBomIds)
  return mergeData(state, {bomIds: toArray(input)})
}

function focusOnEntities (state, input) {
  //console.info('focusing on entitites', input)
  return mergeData(state, {focusInstIds: toArray(input)})
}

function selections (actions, source) {
  // /defaults, what else ?
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
