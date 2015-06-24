import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle

import Class from "classnames"
import {selectBomEntries$, selectBomEntries2$} from '../../actions/bomActions'
//stop-gap, not sure this is needed


function BomView(drivers, props) {
  //let removeEntry$ = drivers.get('DOM', '.remove-btn', 'click')
  //let fieldNames$ = drivers.get('props', 'fieldNames').startWith([])
  //let entries$    = drivers.get('props', 'entries').startWith([])

  //interactions
  let headerTaps$ = drivers.getEventSubject('onClickHeader')

  let fieldNames$      = props.get('fieldNames').startWith([])
  let entries$         = props.get('entries').startWith([])
  let selectedEntries$ = props.get('selectedEntries').startWith([])
  let sortableFields$  = props.get('sortableFields').startWith([])

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

    
  /*
  //does not work for tr/ th ??
  let entryTaps$ = drivers.get(".bomEntry", "click").subscribe(function(data){
    console.log("oooh bomEntry",data.currentTarget)
  })
  let headerTaps$ = drivers.get(".headerCell", "click").subscribe(function(data){
      console.log("headerCell",data.currentTarget.dataset.name)
    })
  //this works
   let bla$ = drivers.get(".btn.pause", "click").subscribe(function(data){
    console.log("oooh interactions",data)
  })
  */

  let entryTaps$ = drivers.getEventSubject('onClickEntry')
    .map( e => e.currentTarget.dataset.uuid )
    .subscribe(function(data){
      selectBomEntries$([data])
    })

  let vtree$ = 
    Rx.Observable.combineLatest(
      fieldNames$,
      entries$,
      selectedEntries$,
      sortFieldName$,
      sortablesDirection$,

      function(fieldNames, entries, selectedEntries, sortFieldName, direction){

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
            <th className="headerCell" data-name={name} onClick={drivers.getEventSubject('onClickHeader').onEvent} > 
              {name} {sortArrow} 
            </th> 
          )
        })

        let rows    = entries.map( function(row, index){
          let cells = fieldNames.map(function(name){         
            return(<td className="bomEntry cell">{row[name]}</td>)
          })

          let selected = selectedEntries.indexOf(row.uuid) > -1
          
          return(
            <tr
              className={Class("bomEntry", {selected: selected})} 
              attributes={{"data-name": row.name}} key={row.uuid}
              data-name={row.name}
              data-uuid={row.uuid}
              onClick={drivers.getEventSubject('onClickEntry').onEvent}
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
    view: vtree$,
    events: {
    }
  }
}

BomView = Cycle.component('BomView',BomView)
export default BomView
