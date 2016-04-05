import { exists } from '../../../utils/utils'

export default function intents (postMessage) {
  const postMessage$ = postMessage
    .filter(exists)
    .filter(p => p.hasOwnProperty('data'))

  const captureScreen$ = postMessage$
    .filter(p => p.data.hasOwnProperty('captureScreen'))
    /* .withLatestFrom(drivers.DOM.select(".glView .container canvas").observable,function(request,element){
      element = element[0]
      return {request,element}
    })*/

  // this one might need refactoring
  const getTransforms$ = postMessage$
    .filter(p => p.data.hasOwnProperty('getTransforms'))

  const getStatus$ = postMessage$
    .filter(p => p.data.hasOwnProperty('getStatus'))

  return {
    captureScreen$,
    getTransforms$,
    getStatus$
  }
}
