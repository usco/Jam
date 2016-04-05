import Rx from 'rx'
import assign from 'fast.js/object/assign'
// let XMLHttpRequest = require("xhr2").XMLHttpRequest

// TODO : merge this with existing XHR-store

export function createResponse$ (options) {
  const defaults = {
    method: 'get',
    encoding: 'utf8',
    mimeType: 'text/plain; charset=x-user-defined',
    responseType: undefined,
    timeout: undefined
  }
  options = assign({}, defaults, options)

  let obs = new Rx.Subject()

  let request = new XMLHttpRequest()

  function handleProgress (e) {
    [e]
      .filter(e => e.lengthComputable)
      .forEach(function (e) {
        obs.onNext({progress: (e.loaded / e.total), total: e.total})
      })
  }
  function handleComplete (e) {
    let response = request.response || request.responseText

    response = options.responseType === 'json' ? JSON.parse(response) : response
    obs.onNext({response})
    obs.onCompleted()
  }

  function handleError (e) {
    console.log('error', request.statusText)
    obs.onError(e)
  }

  request.addEventListener('progress', handleProgress)
  request.addEventListener('load', handleComplete)
  request.addEventListener('error', handleError)
  request.addEventListener('abort', handleError)

  request.open(options.method, options.url, true)
  if ((options.mimeType !== null) && (request.overrideMimeType !== null)) {
    request.overrideMimeType(options.mimeType)
  }
  request.timeout = options.timeout
  request.responseType = options.responseType

  request.send()

  return obs
}

export default function makeHttpDriver ({ eager = false } = {eager: false}) {
  return function httpDriver (request$) {
    let response$$ = request$
      .map(reqOptions => {
        let response$ = createResponse$(reqOptions)
        if (eager || reqOptions.eager) {
          response$ = response$.replay(null, 1)
          response$.connect()
        }
        response$.request = reqOptions
        return response$
      })
      .replay(null, 1)
    response$$.connect()
    return response$$
  }
}

/*
var request$ = Rx.Observable.just({
  url: 'www.google.com',
  method: 'get',
  name: 'foobar-whatever-name-I-want',
  anyOtherDataYouWish: 'asd'
})
Then you can filter for that in the response$
 function main(responses) {
  var response$ = responses.HTTP
    .filter(res$ => res$.request.name === 'foobar-whatever-name-I-want')
    .mergeAll()

*/
