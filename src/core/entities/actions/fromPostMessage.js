export function intent(postMessage, params){
  const postMessage$ = postMessage
    .filter(exists)
    .filter(p=>p.hasOwnProperty("data"))

  const removePartData$ = postMessage$
    .filter(p=>p.data.hasOwnProperty('addPartData'))
    .map(data=>data.data.addPartData)
    .map(toArray)

  const addPartData$ = postMessageWithData$
    .filter(p=>p.data.hasOwnProperty('addPartData'))
    .map(data=>data.data.addPartData)
    .map(toArray)

  return {
    addPartData$,
    removePartData$
  }
}
