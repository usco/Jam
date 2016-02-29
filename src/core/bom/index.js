import Rx from 'rx'
const {fromEvent, merge} = Rx.Observable
import {findIndex,propEq,adjust} from 'ramda'
import {toArray} from '../../utils/utils'
import {exists} from '../../utils/obsUtils'
import {makeModel, mergeData} from '../../utils/modelUtils'

function addBomEntries(state,input){
  //console.log("ADDING BOM entries")
  //FIXME , make immutable
  let newData = toArray(input) || []
  let entries = state.entries.concat(newData)

  let byId = {}
  return {
    entries
    ,byId
  }
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
  let toRemove = input
}

function clearBomEntries(state, input){
  //console.log("clearing BOM", input, state)
  return {entries:[],byId:{}}//mergeData({},defaults)
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
      , findIndex(propEq('id', id))(state.entries) //get index of the one we want to change
      , state.entries)//input data

    return {entries,byId:{}}

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
      , findIndex(propEq('id', id))(state.entries) //get index of the one we want to change
      , state.entries)

    return {entries,byId:{}}
  },state)
}

export default function bom(actions, source) {
  const defaults = {
    entries:[]
    ,byId:{}
  }

  //let updateFns  = {addBomEntries,createBomEntries,removeBomEntries,clearBomEntries}
  let updateFns = {addBomEntries, updateBomEntries, updateBomEntriesCount, clearBomEntries}
  return makeModel(defaults, updateFns, actions, source, {doApplyTransform:false})
}
