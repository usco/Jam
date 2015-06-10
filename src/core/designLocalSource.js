import Rx from 'rx'
import defaults from "./designDefaults"

//let name = localStorage.getItem("jam!-lastDesignName") || undefined
let uri  = localStorage.getItem("jam!-lastDesignUri") || undefined
let _persistent     = JSON.parse( localStorage.getItem("jam!-persistent") ) || false

let designData = Object.assign({},defaults,{uri, _persistent})
export default Rx.Observable.just(designData)
  