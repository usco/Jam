import Rx from 'rx'
//let XMLHttpRequest = require("xhr2").XMLHttpRequest

//TODO : merge this with existing XHR-store

export function createResponse$(options){
  const defaults = {
    responseType:"text"
    ,method:"get"
  }
  options = Object.assign(options,defaults)

  let obs = new Rx.Subject()

  let xmlhttp = new XMLHttpRequest()

  function handleProgress(e){
    [e]
      .filter(e=>e.lengthComputable)
      .forEach(function(e){
        obs.onNext({progress: (e.loaded / e.total),total:e.total}) 
      })  
  }
  function handleComplete(e){
    let response = xmlhttp.response
    response = options.responseType === 'json' ? JSON.parse(response) : response
    obs.onNext({response})
    obs.onCompleted()
  }

  function handleError(e){
    console.log("error",xmlhttp.statusText)
    obs.onError(e)
  }

  xmlhttp.addEventListener("progress", handleProgress)
  xmlhttp.addEventListener("load"    , handleComplete)
  xmlhttp.addEventListener("error"   , handleError)
  xmlhttp.addEventListener("abort"   , handleError)


  xmlhttp.open(options.method,options.url, true)
  xmlhttp.send()

  return obs
}


export default function makeHttpDriver({eager = false} = {eager: false}){

  return function httpDriver(request$){
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