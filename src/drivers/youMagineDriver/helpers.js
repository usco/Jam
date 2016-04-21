import Rx from 'rx'
const Observable = Rx.Observable
const { merge } = Observable

// helper function that takes an input source Observable, a mapper function
// and additional observables to generate a stream of CRUD operations
export function makeApiStream (source$, outputMapper, design$, authData$, apiEndpoint$) {
  const upsert$ = source$
    .map(d => d.upserted)
    .withLatestFrom(design$, authData$, apiEndpoint$, (_entries, design, authData, apiEndpoint) => ({
      _entries,
      designId: design.id,
      authToken: authData.token,
      apiEndpoint
    }))
    .map(outputMapper.bind(null, 'put'))

  const delete$ = source$
    .map(d => d.removed)
    .withLatestFrom(design$, authData$, apiEndpoint$, (_entries, design, authData, apiEndpoint) => ({
      _entries,
      designId: design.id,
      authToken: authData.token,
      apiEndpoint
    }))
    .map(outputMapper.bind(null, 'delete'))

  return merge(upsert$, delete$)
}

// spread out requests with TIME amount of time between each of them
export function spreadRequests (time = 300, data$) {
  /* return Rx.Observable.zip(
    out$,
    Rx.Observable.timer(0, 2000),
    function(item, i) { console.log("data",item); return item}
  ).tap(e=>console.log("api stream",e))*/
  return data$.flatMap(function (items) {
    return Rx.Observable.from(items).zip(
      Rx.Observable.interval(time),
      function (item, index) { return item }
    )
  }) // .tap(e=>console.log("api stream",e))
}
