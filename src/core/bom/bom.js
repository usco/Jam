import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import {toArray} from '../../utils/utils'
import {exists} from '../../utils/obsUtils'
import {makeModelNoHistory, mergeData} from '../../utils/modelUtils'

import logger from 'log-minim'
let log = logger("app")
log.setLevel("debug")


const defaults = {
  entries:[]
  ,byId:{}
}

function addBomEntries(state,input){
  console.log("ADDING BOM entries")
  //FIXME , make immutable
  let newData = toArray(input) || []

  state.entries = state.entries.concat(newData)

  newData.map( entry =>
     state.byId[entry.uuid]= entry
    )

  return state
}

function createBomEntries(state,input){
  let {combos,types} = input
  //console.log("I would register something in BOM", input, state)

  let {entries,byId} = state

  let typeUid   = types.latest
  let type      = types.typeData[typeUid]
  let entryName =  (type !== undefined ? type.name : undefined) 
  let meshName  = types.typeUidToMeshName[typeUid]

  if(type){
    if(! byId[typeUid]){
      let newEntry={
        qty: 1,
        phys_qty: undefined,
        unit: "EA",
        description: undefined,
        uuid: typeUid,
        implementations: {
            "default": meshName
        },
        name: entryName,
        version: "0.0.0"
      }
      
      entries = entries.concat( [newEntry] )
      byId[typeUid] = newEntry
    }
    else
    {
      byId[typeUid].qty +=1
    }
  }
  
  return { entries, byId }
}

//how do we deal with this, as it impacts other data structures ? 
function removeBomEntries(state,input){

}

function clearBomEntries(state, input){
  //console.log("clear BOM", input, state)
  return Object.assign({},defaults)
}


function bom(actions, source) {
  //let updateFns  = {addBomEntries,createBomEntries,removeBomEntries,clearBomEntries}
  let updateFns = {addBomEntries, clearBomEntries}
  return makeModelNoHistory(defaults, updateFns, actions, source)
}


export default bom