import { makeModel, mergeData } from '../../utils/modelUtils'

function setAuthToken (state, input) {
  let output = mergeData(state, {token: input})
  return output
}

export default function auth (actions, source) {
  // /defaults, what else ?
  const defaults = {token: undefined}

  let updateFns = {setAuthToken}
  return makeModel(defaults, updateFns, actions, source)
}
