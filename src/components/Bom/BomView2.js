import Cycle from "cyclejs"
let {Rx} = Cycle
let Observable = Rx.Observable

function BomView(drivers) {
  let removeEntry$ = drivers.get('DOM', '.remove-btn', 'click')
  let fieldNames = drivers.get('props', 'fieldNames')
  let entries = drivers.get('props', 'fieldNames')

  let headers = fieldNames.map( name => <th>{name}</th> )
  let rows    = entries.map( function(row){

  })

  let vtree$ = 
    <table>
      <thead>
          <tr>
            {headers}
          </tr>
      </thead>
      <tbody>
        <tr>
          <td>
          </td>
        <tr>
      </tbody>
    </table>

  return {
    DOM: vtree$,
    events: {
      destroy: destroy$,
      changeColor: changeColor$,
      changeWidth: changeWidth$
    }
  }
}