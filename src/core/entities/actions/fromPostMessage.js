import Rx from 'rx'
const {fromArray} = Rx.Observable
import { toArray, exists } from '../../../utils/utils'

export default function intent (postMessage, params) {
  const postMessage$ = postMessage
    .filter(exists)
    .filter(p => p.hasOwnProperty('data'))

  const addPartData$ = postMessage$
    .filter(p => p.data.hasOwnProperty('addPartData'))
    .map(data => data.data.addPartData)
    .map(toArray)
    .tap(e => console.log('addPartData (fromPostMessage)', e))

  const removePartData$ = postMessage$
    .filter(p => p.data.hasOwnProperty('removePartData'))
    .map(data => data.data.removePartData)
    // .map(entry=>({id:entry.uuid}))
    .map(toArray)

  const removeTypes$ = removePartData$
    .map(function (data) {
      return data.map(entry => ({ id: entry.uuid }))
    })
    .tap(e => console.log('removeTypes (fromPostMessage)', e))

  const deleteInstances$ = removePartData$
    .map(function (data) {
      return data.map(entry => ({typeUid: entry.uuid}))
    })
    .tap(e => console.log('deleteInstances (fromPostMessage)', e))

  // we create special "read an html5 file " requests with added id
  const desktopRequests$ = addPartData$
    .map(function (data) {
      return data.map(function (entry) {
        return {
          id: entry.uuid,
          uri: entry.file.name, // name of the html5 File object
          method: 'get',
          data: entry.file,
          // url:req.uri,
          src: 'desktop',
          type: 'resource'
        }
      })
    })
    .flatMap(fromArray)
    .tap(e => console.log('desktopRequests (fromPostMessage)', e))

  return {
    addPartData$,
    removePartData$,

    removeTypes$,
    deleteInstances$,

    // UGH
    desktopRequests$
  }
}
