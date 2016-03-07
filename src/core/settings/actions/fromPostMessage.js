import {toArray, exists, stringToBoolean} from '../../../utils/utils'

export default function intent(postMessage, params){
  const postMessage$ = postMessage
    .filter(exists)
    .filter(p=>p.hasOwnProperty("data"))

  const setSaveMode$ = postMessage$
    .filter(p=>p.data.hasOwnProperty('setSaveMode'))
    .map(data=>data.data.setSaveMode)
    .filter(exists)
    .map(stringToBoolean)

  return {
    setSaveMode$
  }
}
