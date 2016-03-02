import Rx from 'rx'
const {fromEvent, merge} = Rx.Observable
import {findIndex,propEq,adjust,flatten} from 'ramda'
import {toArray} from '../../utils/utils'
import {exists} from '../../utils/obsUtils'
import {makeModel, mergeData} from '../../utils/modelUtils'



function upsertBomEntry(state, input){
  const index = findIndex(propEq('id', input.id))(state)
  const entry = input.data

  if(index===-1){//if we have a bom entry that is new
    return state = state.concat( toArray(entry) )
  }else{//we already have this same bom entry
    state = [
      ...state.slice(0, index),
      mergeData(state[index], entry),
      ...state.slice(index + 1)
    ]
  }
}

function addBomEntries(state,input){
  console.log("ADDING BOM entries", state, input)
  let newData = toArray(input) || []
  let entries = flatten( newData.map(upsertBomEntry.bind(null,state)) )

  return entries
}

function createBomEntries(state,input){
  let {combos,types} = input
  //console.log("I would register something in BOM", input, state)

  let entries = state

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

//remove an entry
function removeBomEntries(state, input){
  const index = findIndex(propEq('id', input.id))(state)
  state=[
    ...state.slice(0, index),
    ...state.slice(index + 1)
  ]
  return state
}

function clearBomEntries(state, input){
  //console.log("clearing BOM", input, state)
  return []
}

function updateBomEntries(state, inputs){
  //console.log("updating BOM", inputs, state)
  return inputs.reduce(function(state, {id,attrName,value}){

    const entries = adjust(
      function(item){
        let updatedData = {}
        updatedData[attrName] = value
        return mergeData({},item,updatedData)
      }
      , findIndex(propEq('id', id))(state) //get index of the one we want to change
      , state)//input data

    return entries

  },state)
}

function updateBomEntriesCount(state, inputs){
  //console.log("updateBomEntriesCount",inputs)
  return inputs.reduce(function(state,{id,offset}){
    const entries = adjust(
      function(item){
        const qty = Math.max(item.qty+offset,0)
        return mergeData({},item,{qty:qty})
      }
      , findIndex(propEq('id', id))(state) //get index of the one we want to change
      , state)

    return entries
  },state)
}

export default function bom(actions) {
  const defaults = []
  const updateFns = {addBomEntries, updateBomEntries, updateBomEntriesCount, clearBomEntries}
  return makeModel(defaults, updateFns, actions)
}
