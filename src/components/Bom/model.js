import {exists, combineLatestObj} from '../../utils/obsUtils'
import {generateUUID} from '../../utils/utils'

function sortBy(fieldName){
  return function(a,b){
    if (a[fieldName] > b[fieldName]) {
      return 1
    }
    if (a[fieldName] < b[fieldName]) {
      return -1
    }
    // a must be equal to b
    return 0
  }
}

export default function model(props$, actions){
  const fieldNames$        = props$.pluck('fieldNames').startWith([]).filter(exists)
  const sortableFields$    = props$.pluck('sortableFields').startWith([]).filter(exists)
  const editableFields$    = props$.pluck('editableFields').startWith([]).filter(exists)
  const entries$           = props$.pluck('entries').startWith([]).filter(exists)
  const fieldDescriptions$ = props$.pluck('fieldDescriptions').startWith({})
  const fieldTypes$        = props$.pluck('fieldTypes').startWith({})
  const units$             = props$.pluck('units').startWith([])
  const selectedEntries$   = props$.pluck('selectedEntries').startWith([]).filter(exists)
    .distinctUntilChanged()
    .shareReplay(1)
  const readOnly$          = props$.pluck('readOnly').startWith(false)


  //observable of current sorting field (what field do we sort by)
  const sortFieldName$ = actions.headerTapped$
    .map(e => e.currentTarget.dataset.name)
    .startWith(undefined)
    //.filter( name => sortableFields.indexOf(name)>1 )

  //ascending, descending, neutral
  const sortablesDirection$ = actions.headerTapped$
    .map( e => undefined)
    .scan(function (acc, x) {
      if(!acc) return true
      return !acc
    },false)
    .startWith(undefined)

  //actual entries (filtered, sorted etc)
  const sortedEntries$ = entries$
    .combineLatest(sortFieldName$, sortablesDirection$, function(entries, sortFieldName, direction){
      if(!sortFieldName) return entries

      let output = entries.sort( sortBy(sortFieldName) )
      if(direction!==undefined && direction === false ) {
        output = output.reverse()
      }
      return output
    })

  ////////
  const toggled$ = actions.toggle$
    .startWith(true)

  const removeEntryRequested$ = actions.removeEntryRequest$
    .startWith(undefined)
    .merge(
      actions.removeEntryRequestCancel$.map(undefined)
    ).merge(
      actions.removeEntry$.map(undefined)
    )
    .tap(e=>console.log("removeEntryRequested",e))

  function makeNewEntryDefaults(){

    const newEntryDefaults = {
        name:""
        , qty:0
        , _qtyOffset:0//this is for "dynamic" entities only , and should be disregarded when saving the bom
        , phys_qty:0
        , version:"0.0.1"
        , unit:"EA"
        , printable:false
        , _adder:true//special flag for adder
        , id : generateUUID()//this is a what allows forcing the dom to refresh
      }
      return newEntryDefaults
  }

  const newEntryValues$ = actions.addEntry$
    .map(e=>(makeNewEntryDefaults()))
    .startWith(makeNewEntryDefaults())

  return combineLatestObj({entries$:sortedEntries$, selectedEntries$
    , fieldNames$, sortFieldName$, sortablesDirection$, editableFields$, fieldDescriptions$, fieldTypes$, units$,
    newEntryValues$, toggled$, removeEntryRequested$, readOnly$})
}
