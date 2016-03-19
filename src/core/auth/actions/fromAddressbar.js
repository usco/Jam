import Rx from 'rx'
const {fromArray} = Rx.Observable
import {exists} from '../../../utils/utils'

export default function intent(addressbar, params){

  const setAuthToken$ = addressbar.get('authToken')
    .flatMap(fromArray)
    .filter(exists)

  return {
    setAuthToken$
  }
}
