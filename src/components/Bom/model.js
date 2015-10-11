import {exists} from '../../utils/obsUtils'
import {combineLatestObj} from '../../utils/obsUtils'

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
  const fieldNames$      = props$.pluck('fieldNames').startWith([]).filter(exists)
  const selectedEntries$ = props$.pluck('selectedEntries').startWith([]).filter(exists)
  const sortableFields$  = props$.pluck('sortableFields').startWith([]).filter(exists)
  let entries$           = props$.pluck('entries').startWith([]).filter(exists)


  //observable of current sorting field (what field do we sort by)
  let sortFieldName$ = actions.headerTapped$
    .map(e => e.currentTarget.dataset.name)
    .startWith(undefined)
    //.filter( name => sortableFields.indexOf(name)>1 )

  //ascending, descending, neutral 
  let sortablesDirection$ = actions.headerTapped$
    .map( e => undefined)
    .scan(false, function (acc, x) { 
      if(!acc) return true
      return !acc
    })
    .startWith(undefined)

  //actual entries (filtered, sorted etc)
  entries$ = entries$
    .combineLatest(sortFieldName$, sortablesDirection$, function(entries, sortFieldName, direction){
      if(!sortFieldName) return entries 

      let output = entries.sort( sortBy(sortFieldName) )
      if(direction!==undefined && direction === false ) {
        output = output.reverse()
      }
      return output
    })

  return combineLatestObj({entries$, selectedEntries$, fieldNames$, sortFieldName$, sortablesDirection$})
}