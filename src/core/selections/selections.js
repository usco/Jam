import { toArray } from '../../utils/utils'
import { makeModel, mergeData } from '../../utils/modelUtils'

function selectEntities (state, input) {
  // log.info("selecting entitites",sentities)
  return mergeData(state, {instIds: toArray(input)})
}

function selectBomEntries (state, input) {
  // log.info("selecting types",sBomIds)
  return mergeData(state, {bomIds: toArray(input)})
}

function selections (actions, source) {
  // /defaults, what else ?
  const defaults = {
    instIds: [],
    bomIds: []
  }

  let updateFns = {
    selectEntities,
    selectBomEntries
  }
  return makeModel(defaults, updateFns, actions)
}

export default selections
