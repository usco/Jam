import Rx from 'rx'
const {fromArray} = Rx.Observable
import { exists } from '../../../utils/utils'

export default function intent (addressbar, params) {
  const loadDesign$ = addressbar.get('designId')
    .flatMap(fromArray)
    .filter(exists)

  const setAuthToken$ = addressbar.get('authToken')

  /*

  export function authToken(addressbar, params){
    return addressbar.get('authToken')
      //.tap(e=>console.log("authToken",e))
  }*/

  return {
    loadDesign$
  // ,setAuthToken$
  }
}
