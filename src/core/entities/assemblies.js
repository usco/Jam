// TODO: if all we deal with is pseudo 'selection' ie, active assembly, we
// should move this to selections perhaps ?

import { makeModel, mergeData } from '../../utils/modelUtils'
import { generateUUID } from '../../utils/utils'

// one typical entry
/*
{
   "uuid": "xxxxx-xxxx-xxx-x",
   "name": "some assembly",
   "description": "test"
 }*/

// actual api functions
function setActiveAssembly (state, input) {
  return mergeData(state, {currentAssembly: input})
}

export default function types (actions, source) {
  const defaults = { currentAssembly: generateUUID() }

  const updateFns = {setActiveAssembly}
  return makeModel(defaults, updateFns, actions)
}
