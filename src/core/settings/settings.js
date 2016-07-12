import { makeModel, mergeData } from '../../utils/modelUtils'
import { omit } from 'ramda'

/* shortcuts:[
  {keys:'⌘+z,ctrl+z', "command":'undo'},
  {keys:'⌘+shift+z,ctrl+shift+z', "command":'redo'},

  {keys:'⌘+r,ctrl+d', "command":'duplicateEntities'},
  {keys:'delete,backspace'    , "command":'removeEntities'},
  {keys:'m'         , "command":'toTranslateMode'},
  {keys:'r'         , "command":'toRotateMode'},
  {keys:'s'         , "command":'toScaleMode'}
],*/

// use mainly when reloading settings from localstorage
function setAllValues (state, input) {
  // console.log("setting settings")
  // TODO : do validation ?
  // FIXME: race condition !!! we are not sure this is the first !
  // we coerce appMode to "editor" when setting all values like this
  // same with autoSave && autoLoad
  input = omit(['autoSave', 'autoLoad', 'toolSets'], input) // we do not want to reload any of these

  let output = mergeData(state, mergeData(input, {
    appMode: 'editor',
    activeTool: undefined
  }))

  return output
}

function toggleShowGrid (state, input) {
  console.log('toggleShowGrid', input)
  let output = mergeData(state, {grid: {show: input}})
  return output
}

function toggleShowAnnot (state, input) {
  console.log('toggleShowAnnot', input)
  let output = mergeData(state, {annotations: {show: input}})
  return output
}

function toggleAutoRotate (state, input) {
  console.log('toggleAutoRotate', input)
  let output = mergeData(state, {camera: {autoRotate: input}})
  return output
}

function toggleSnapScaling (state, input) {
  console.log('toggleSnapScaling', input)
  let output = mergeData(state, {snapScaling: input})
  return output
}

function toggleUniformScaling (state, input) {
  console.log('toggleUniformScaling', input)
  let output = mergeData(state, {uniformScaling: input})
  return output
}

function toggleSnapRotation (state, input) {
  console.log('toggleSnapRotation', input)
  let output = mergeData(state, {snapRotation: input})
  return output
}

function toggleSnapTranslation (state, input) {
  console.log('toggleSnapTranslation', input)
  return mergeData(state, {snapTranslation: input})
}

function setActiveTool (state, input) {
  console.log('setting activeTool', input)
  let output = mergeData(state, {activeTool: input})
  return output
}

function setAppMode (state, input) {
  let toolSets
  if (input === 'viewer') {
    toolSets = ['view']
  }else if (input === 'editor') {
    toolSets = ['view', 'edit']
  }
  let output = mergeData(state, {toolSets})
  return output
}

function setToolsets (state, input) {
  let output = mergeData(state, {toolSets: input})
  // console.log("setting app mode",output)
  return output
}

function setAutoSave (state, input) {
  let output = mergeData(state, {autoSave: input})
  console.log('setting autoSave mode', output)
  return output
}

function setAutoLoad (state, input) {
  let output = mergeData(state, {autoLoad: input})
  console.log('setting autoLoad mode', output)
  return output
}

function settings (actions, source) {
  // source = source || Rx.Observable.never()
  // source = source.map(src => mergeData( src, {appMode:"editor"}) )//default appMode to editor, disregard saved settings

  // /defaults, what else ?
  const defaults = {
    webglEnabled: true,
    appMode: 'editor',

    autoSelectNewEntities: true,
    activeTool: undefined,
    repeatTool: false,

    toolSets: ['view', 'edit', 'annotate'], // what categories of tools do we want on screen

    selections: undefined, // FIXME : not entirely sure this should even be here

    // these are "domain specific", there should be a way for sub systems
    // to "hook up" to the main data storage
    viewMode: 'default',

    camera: {
      autoRotate: false
    },
    grid: {
      show: true
    },
    annotations: {
      show: true
    },

    // persistence
    autoSave: false,
    autoLoad: true,

    //transforms
    snapScaling: true,
    uniformScaling: true,
    snapRotation: true,
    snapTranslation: true
  }

  let updateFns = {setAllValues, toggleShowGrid, toggleAutoRotate,
    toggleSnapScaling, toggleUniformScaling, toggleSnapRotation, toggleSnapTranslation,
    setActiveTool, setAppMode, setToolsets, setAutoSave, setAutoLoad}
  return makeModel(defaults, updateFns, actions, source)
}

export default settings
