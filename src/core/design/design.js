import Rx from 'rx'
let {fromEvent, Observable, merge} = Rx.Observable
import {makeModel, mergeData} from '../../utils/modelUtils'


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

  id:undefined,
  ns:undefined,
  synched:false
}


function newDesign(state, input){
  let design = assign({}, defaults)
  return design
}

function updateDesign(state, input){
  log.info("setting design data", input)
  let design = assign({}, state, input)
  return design
}

function loadDesign(state, input){
  console.log("designInfos",input)
  return {synched:true, id:input, ns:'ym'}
}

function clearDesign(state, input){
  return defaults
}

function model(actions, source){
  let updateFns  = {newDesign, updateDesign, loadDesign, clearDesign}
  return makeModel(defaults, updateFns, actions, undefined, {doApplyTransform:false})//since we store meshes, we cannot use immutable data
}

export default model
