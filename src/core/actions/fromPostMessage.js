import {exists,toArray} from '../../utils/utils'


export function intentsFromPostMessage(drivers){
  const postMessage$ = drivers.postMessage
    .filter(exists)

  const postMessageWithData$ = postMessage$
    .filter(p=>p.hasOwnProperty("data"))

  const captureScreen$ = postMessageWithData$
    .filter(p=>p.data.hasOwnProperty("captureScreen"))
    .withLatestFrom(drivers.DOM.select(".glView .container canvas").observable,function(request,element){
      element = element[0]
      return {request,element}
    })

  //this one might need refactoring
  const getTransforms$ = postMessageWithData$
    .filter(p=>p.data.hasOwnProperty("getTransforms"))

  const getStatus$ = postMessageWithData$
    .filter(p=>p.data.hasOwnProperty("getStatus"))

  const clearDesign$ = postMessageWithData$
    .filter(p=>p.data.hasOwnProperty("clear"))

  const loadDesign$ = postMessageWithData$
    .filter(p=>p.data.hasOwnProperty('designId'))
    .map(data=>data.data.designId)

  const addPartData$ = postMessageWithData$
    .filter(p=>p.data.hasOwnProperty('addPartData'))
    .map(data=>data.data.addPartData)
    .map(toArray)

  const removePartData$ = postMessage$
    .filter(p=>p.data.hasOwnProperty('removePartData'))
    .map(data=>data.data.removePartData)
    .map(toArray)

  return {
    captureScreen$
    ,getTransforms$
    ,getStatus$
    ,clearDesign$
    ,loadDesign$
    ,addPartData$
    ,removePartData$
  }
}
