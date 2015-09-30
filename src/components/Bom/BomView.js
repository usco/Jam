/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from "classnames"

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


function intent(DOM){
  let entryTaps$  = DOM.select(".bomEntry").events('click')
  let headerTaps$ = DOM.select(".headerCell").events('click')

}

function BomView({DOM, props$}) {
  //let removeEntry$ = DOM.select('DOM', '.remove-btn', 'click')
  //let fieldNames$ = DOM.select('props', 'fieldNames').startWith([])

  //actions
  let entryTaps$ = DOM.select(".bomEntry").events("click")
  let headerTaps$ = DOM.select(".headerCell").events("click")

  entryTaps$.subscribe((data)=>console.log("oooh bomEntry",data.currentTarget))
  headerTaps$.subscribe((data)=>console.log("headerCell",data.currentTarget.dataset.name))

  let fieldNames$      = props$.pluck('fieldNames').startWith([]).filter(exists)
  let entries$         = props$.pluck('entries').startWith([]).filter(exists)
  let selectedEntries$ = props$.pluck('selectedEntries').startWith([]).filter(exists)
  let sortableFields$  = props$.pluck('sortableFields').startWith([]).filter(exists)

  //observable of current sorting field (what field do we sort by)
  let sortFieldName$ = headerTaps$
    .map(e => e.currentTarget.dataset.name)
    .startWith(undefined)
    //.filter( name => sortableFields.indexOf(name)>1 )

  //ascending, descending, neutral 
  let sortablesDirection$ = headerTaps$
    .map( e => undefined)
    .scan(function (acc, x) { 
      if(!acc) return true
      return !acc
    })
    .startWith(undefined)


  entries$ = entries$
    .combineLatest(sortFieldName$, sortablesDirection$, function(entries, sortFieldName, direction){
      if(!sortFieldName) return entries 

      let output = entries.sort( sortBy(sortFieldName) )
      if(direction!==undefined && direction === false ) {
        output = output.reverse()
      }
      return output
    })
    //.map( x => x.sort(sortBy( ) ) )

  let vtree$ = combineLatestObj({fieldNames$,
      entries$,
      selectedEntries$,
      sortFieldName$,
      sortablesDirection$})
      .map( function({fieldNames, entries, selectedEntries, sortFieldName, direction}){
        
        let headers = fieldNames.map( function(name){
          let sortArrow = undefined

          if( direction !== undefined && sortFieldName === name)
          {
            if(direction){
              sortArrow = <span className="directionArrow"> &#x25B2;</span>
            }else{
              sortArrow = <span className="directionArrow"> &#x25BC;</span>
            }
          }
          return (
            <th className="headerCell" data-name={name}> 
              {name} {sortArrow} 
            </th> 
          )
        })

        let rows    = entries.map( function(row, index){
          let cells = fieldNames.map(function(name){         
            return(<td className="bomEntry cell">{row[name]}</td>)
          })

          cells.push(<td className="bomEntry cell"> <button>Change Model</button> </td>)

          let selected = selectedEntries.indexOf(row.uuid) > -1
          
          return(
            <tr
              className={Class("bomEntry", {selected: selected})} 
              attributes={{"data-name": row.name}} key={row.uuid}
              data-name={row.name}
              data-uuid={row.uuid}
              >
              {cells}
            </tr>
          )
        })

        return (
          <div className="bom">
            <table >
              <thead>
                <tr>
                  {headers}
                </tr>
              </thead>
              <tbody>
                {rows}
              </tbody>
            </table> 
          </div>
        )
      }
    )
    
  return {
    DOM: vtree$,
    events: {
      entryTaps$
    }
  }
}

export default BomView
