import { findIndex, propEq, adjust } from 'ramda'
import { toArray, exists, coerceTypes } from '../../utils/utils'
import { makeModel, mergeData } from '../../utils/modelUtils'

function upsertBomEntry (state, input) {
  const index = findIndex(propEq('id', input.id))(state)

  if (index === -1) { // if we have a bom entry that is new
    const bomEntryDefaults = {
      name: undefined,
      qty: 0,
      _qtyOffset: 0, // this is for "dynamic" entities only , and should be disregarded when saving the bom
      phys_qty: 0,
      version: '0.0.1',
      unit: 'EA',
      printable: true,
      dynamic: false
    }
    const entry = mergeData(bomEntryDefaults, input.data)
    state = state.concat(toArray(entry))
    return state
  } else { // we already have this same bom entry
    state = [
      ...state.slice(0, index),
      mergeData(state[index], input.data),
      ...state.slice(index + 1)
    ]
    return state
  }
}

function upsertBomEntries (state, input) {
  console.log('upsert BOM entries', state, input)
  let newData = toArray(input) || []
  return newData.filter(exists)
    .reduce(function (state, entry) {
      return upsertBomEntry(state, entry)
    }, state)
    // let entries = flatten( newData.filter(exists).map(upsertBomEntry.bind(null,state)) )
}

// remove an entry
function removeBomEntries (state, inputs) {
  console.log('removeBomEntries', inputs)
  return inputs.reduce(function (state, input) {
    const index = findIndex(propEq('id', input.id))(state)
    state = [
      ...state.slice(0, index),
      ...state.slice(index + 1)
    ]
    return state
  }, state)
}

function clearBomEntries (state, input) {
  return []
}

function updateBomEntries (state, inputs) {
  const typeMapping = {
    'qty': function (value) { return Math.max(Math.round(value), 0) }, // quantities of parts are always positive, always integers
    'phys_qty': function (value) { return Math.max(value, 0) } // physical quantities in our cases are always positive (no negative lengths, weifhts, volumes)
  }

  inputs = inputs.map(function ({attrName, id, value}) {
    let data = {}
    data[attrName] = value
    data = coerceTypes(typeMapping, data)
    return mergeData({id}, {data})
  })
  return upsertBomEntries(state, inputs)
}

// these are only for dynamic entries ie : if a part gets duplicated , deleted etc
// as such they are dealt with seperatly
function updateBomEntriesCount (state, inputs) {
  console.log('updateBomEntriesCount', inputs)
  return inputs.reduce(function (state, {id, offset}) {
    // TODO: refactor
    const idx = findIndex(propEq('id', id))(state)
    if (idx === -1) {
      return state
    }
    const entries = adjust(
      function (item) {
        const _qtyOffset = Math.max(item._qtyOffset + offset, 0)
        const qty = Math.max(item.qty + offset, _qtyOffset)
        return mergeData({}, item, {_qtyOffset, qty, dynamic: true})
      }
      , findIndex(propEq('id', id))(state) // get index of the one we want to change
      , state)

    return entries
  }, state)
}

export default function bom (actions) {
  const defaults = []
  const updateFns = {upsertBomEntries, updateBomEntries, updateBomEntriesCount, removeBomEntries, clearBomEntries}
  return makeModel(defaults, updateFns, actions)
}
