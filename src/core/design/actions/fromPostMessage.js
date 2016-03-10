import {exists} from '../../../utils/utils'

export default function intent(postMessage, params){

  const postMessage$ = postMessage
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
