import { makeModel } from '../../utils/modelUtils'
import assign from 'fast.js/object/assign' // faster object.assign

const defaults = {
  /* name       : undefined
  ,description: undefined
  ,version    : undefined//"0.0.0",
  ,authors    : []
  ,tags       : []
  ,licenses   : []
  ,meta       : undefined

  ,id         : undefined
  ,uri        : undefined*/

  id: undefined,
  ns: undefined,
  synched: false
}

function newDesign (state, input) {
  let design = assign({}, defaults)
  return design
}

function updateDesign (state, input) {
  // log.info('setting design data', input)
  let design = assign({}, state, input)
  return design
}

function loadDesign (state, input) {
  console.log('designInfos', input)
  return {synched: true, id: input, ns: 'ym'}
}

function clearDesign (state, input) {
  return defaults
}

export default function design (actions, source) {
  console.log('design')
  let updateFns = {newDesign, updateDesign, loadDesign, clearDesign}
  return makeModel(defaults, updateFns, actions, source)
}
