import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent
let just      = Observable.just
import addressbar from 'addressbar'

import {fetchUriParams}  from '../../utils/urlUtils'
import {exists}  from '../../utils/utils'


/*addressbar.addEventListener('change', function (event) {
  event.preventDefault()
  event.target.value // The value of the addressbar
})
addressbar.value = "http://localhost:3001/index.html?foo=42"

*/

export function addressbarDriver(outgoing$){

  let address$ = Rx.Observable.fromEvent(addressbar,"change")
    .map(e=>e.target.value)
    .startWith(addressbar.value)

  function get (paramName) {
    return address$
      .map(url=>fetchUriParams(url,paramName))
      .filter(exists)
      .filter(a=>(a.length>0))
  }

  return {
    address$
    ,get
  }
}