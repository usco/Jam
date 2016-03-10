import {toArray, exists} from '../../../utils/utils'

export default function intent(postMessage, params){
  const postMessage$ = postMessage
    .filter(exists)
    .filter(p=>p.hasOwnProperty("data"))

  const addPartData$ = postMessage$
    .filter(p=>p.data.hasOwnProperty('addPartData'))
    .map(data=>data.data.addPartData)
    .map(toArray)

  const removePartData$ = postMessage$
    .filter(p=>p.data.hasOwnProperty('removePartData'))
    .map(data=>data.data.removePartData)
    //.map(entry=>({id:entry.uuid}))
    .map(toArray)


    /*const removeTypes$ = actionsFromPostMessage.removePartData$
      .map(function(data){
        return data.map()
      })
      .tap(e=>console.log("removeTypes (fromPostMessage)",e))


    const deleteInstances$ = actionsFromPostMessage.removePartData$
      .map(function(data){
        return data.map(entry=>({typeUid:entry.uuid}))
      })
      .tap(e=>console.log("deleteInstances",e))*/

  return {
    addPartData$,
    removePartData$
  }
}
