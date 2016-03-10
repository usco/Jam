export function intent(postMessage, params){
  const postMessage$ = drivers.postMessage
    .filter(exists)
    .filter(p=>p.hasOwnProperty("data"))

  const loadDesign$ = postMessage$
    .filter(p=>p.data.hasOwnProperty('designId'))
    .map(data=>data.data.designId)

  const clearDesign$ = postMessage$
    .filter(p=>p.data.hasOwnProperty("clear"))

  return {
    loadDesign$
    ,clearDesign$
  }
}
