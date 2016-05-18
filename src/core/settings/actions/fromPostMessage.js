import { exists, stringToBoolean } from '../../../utils/utils'

export default function intent (postMessage, params) {
  const postMessage$ = postMessage
    .filter(exists)
    .filter(p => p.hasOwnProperty('data'))

  const setAutoSave$ = postMessage$
    .filter(p => p.data.hasOwnProperty('setAutoSave'))
    .map(data => data.data.setAutoSave)
    .filter(exists)
    .map(stringToBoolean)

  const setAutoLoad$ = postMessage$
    .filter(p => p.data.hasOwnProperty('setAutoLoad'))
    .map(data => data.data.setAutoLoad)
    .filter(exists)
    .map(stringToBoolean)

  const setCameraPosition$ = postMessage$
    .filter(p => p.data.hasOwnProperty('setCameraPosition'))
    .do(e=>console.log('setCameraPosition',e))
    .map(data => data.data.setCameraPosition)
    .filter(exists)

  return {
    setAutoSave$,
    setAutoLoad$,
    setCameraPosition$
  }
}
