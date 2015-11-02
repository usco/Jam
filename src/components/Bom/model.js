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
  const sortableFields$  = props$.pluck('sortableFields').startWith([]).filter(exists)
  const entries$         = props$.pluck('entries').startWith([]).filter(exists)
  const selectedEntries$ = props$.pluck('selectedEntries').startWith([]).filter(exists)
    .distinctUntilChanged()
    .shareReplay(1)


  //observable of current sorting field (what field do we sort by)
  const sortFieldName$ = actions.headerTapped$
    .map(e => e.currentTarget.dataset.name)
    .startWith(undefined)
    //.filter( name => sortableFields.indexOf(name)>1 )

  //ascending, descending, neutral 
  const sortablesDirection$ = actions.headerTapped$
    .map( e => undefined)
    .scan(false, function (acc, x) { 
      if(!acc) return true
      return !acc
    })
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

  const toggled$ = actions.toggle$.startWith(false)

  return combineLatestObj({entries$:sortedEntries$, selectedEntries$, fieldNames$, sortFieldName$, sortablesDirection$, toggled$})
}