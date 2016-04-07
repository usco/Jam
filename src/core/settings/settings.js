import { makeModel, mergeData } from '../../utils/modelUtils'

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
  // same with saveMode
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

function setSaveMode (state, input) {
  let output = mergeData(state, {saveMode: input})
  console.log('setting save mode', output)
  return output
}

function settings (actions, source) {
  // source = source || Rx.Observable.never()
  // source = source.map(src => mergeData( src, {appMode:"editor"}) )//default appMode to editor, disregard saved settings

  // /defaults, what else ?
  const defaults = {
    webglEnabled: true,
    appMode: 'editor',
    saveMode: false,
    autoSelectNewEntities: true,
    activeTool: undefined,
    repeatTool: false,

    toolSets: ['view', 'edit', 'annotate'], // what categories of tools do we want on screen

    selections: undefined,

    // these are "domain specific", there should be a way for sub systems
    // to "hook up" to the main data storage
    camera: {
      autoRotate: false
    },
    grid: {
      show: true
    },
    annotations: {
      show: true
    }
  }

  let updateFns = {setAllValues, toggleShowGrid,
    toggleAutoRotate, setActiveTool, setAppMode, setToolsets,
  setSaveMode}
  return makeModel(defaults, updateFns, actions, source)
}

export default settings
