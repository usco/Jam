//import Cycle from "cyclejs"
//let {Rx} = Cycle
//let Observable = Rx.Observable


let Cycle = require('cycle-react')
let React = Cycle.React
let Rx = Cycle.Rx
import Class from "classnames"
import {selectBomEntries$, selectBomEntries2$} from '../../actions/bomActions'
//stop-gap, not sure this is needed


function BomView(drivers, props) {
  console.log("drivers",drivers,"props",props)
  //let removeEntry$ = drivers.get('DOM', '.remove-btn', 'click')
  //let fieldNames$ = drivers.get('props', 'fieldNames').startWith([])
  //let entries$    = drivers.get('props', 'entries').startWith([])

  let fieldNames$      = props.get('fieldNames').startWith([])
  let entries$         = props.get('entries').startWith([])
  let selectedEntries$ = props.get('selectedEntries').startWith([])
  let sortableFields$  = props.get('sortableFields').startWith([])


  entries$ = entries$.map( x => x.sort() )

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

  /*
  entries = entries.sort(function(a,b){
        if (a.name > b.name) {
          return 1
        }
        if (a.name < b.name) {
          return -1
        }
        // a must be equal to b
        return 0
      })*/

  let entryTaps$ = drivers.getEventSubject('onClickEntry')
    .map( e => e.currentTarget.dataset.uuid )
    .subscribe(function(data){
      console.log("cell",data)
      selectBomEntries$([data])
    })
  let headerTaps$ = drivers.getEventSubject('onClickHeader').subscribe(function(data){
      console.log("header",data.currentTarget.dataset.name)
    })
  let activeSorter$ = null

  /* headerTaps$ = headerTaps$
      .filter( name => sortableFields.indexOf(name)>1 )

    entries$ = Observable
      .just(entries)
      .startWith([])
      .map( x => x.sort )*/

  let vtree$ = 
    Rx.Observable.combineLatest(
      fieldNames$,
      entries$,
      selectedEntries$,
      function(fieldNames, entries, selectedEntries){
        console.log("here in BomView", fieldNames, entries)

        let headers = fieldNames.map( name => <th className="headerCell" data-name={name} onClick={drivers.getEventSubject('onClickHeader').onEvent} > {name} </th> )
        let rows    = entries.map( function(row, index){

          let cells = fieldNames.map(function(name){         
            return(<td className="bomEntry cell">{row[name]}</td>)
          })

          let selected = selectedEntries.indexOf(row.uuid) > -1
          
          return(
            <tr
              className={Class("bomEntry", {selected: selected})} 
              attributes={{"data-name": row.name}} key={row.name}
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
            <div>
            <button className="btn btn-default pause" >Pause</button>
            </div>
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
      /*destroy: destroy$,
      changeColor: changeColor$,
      changeWidth: changeWidth$*/
    }
  }
  
}

BomView = Cycle.createReactClass('CounterText',BomView)
export default BomView
