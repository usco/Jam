import test from 'ava'
import Rx from 'rx'
const of = Rx.Observable.of
const never = Rx.Observable.never
import api from './api'

test.cb('api: should return transforms when requested', t => {

  const actions = {
    apiActions: {
      getTransforms$: of(undefined),        getStatus$: never(),        captureScreen$: never()
    }
  }

  const state$ = of({
    transforms: {
      'key': {pos: [0, 0, 1],rot: [0, 1, 2.5],sca: [1, 1, 1.25]}
    }
  })

  api(actions, state$)
    .outputs$
    .forEach(function (data) {
      const {request, response, requestName} = data

      t.deepEqual(requestName, 'getTransforms')
      t.deepEqual(response.length, 1)
      t.deepEqual(response[0].pos, [0, 0, 1])
      t.deepEqual(response[0].rot, [0, 1, 2.5])
      t.deepEqual(response[0].sca, [1, 1, 1.25])

      t.end()
    })
})

test.cb('api: should return status when requested', t => {

  const actions = {
    apiActions: {
      getTransforms$: never(),
      getStatus$: of(undefined),
      captureScreen$: never()
    }
  }

  const state$ = of({
    settings: {
      activeTool: 'hat'
    }
  })

  api(actions, state$)
    .outputs$
    .forEach(function (data) {
      const {request, response, requestName} = data

      t.deepEqual(requestName, 'getStatus')
      t.deepEqual(response, {activeTool: 'hat'})

      t.end()
    })
})

// TODO: do this better ?
if (typeof (document) !== 'undefined') {
  test.cb('api: should capture screen when requested', t => {

    const actions = {
      apiActions: {
        getTransforms$: never(),
        getStatus$: never(),
        captureScreen$: of({
          request: 'captureScreen',
          element: document.createElement('div')
        })
      }
    }

    const state$ = of({})

    api(actions, state$)
      .outputs$
      .forEach(function (data) {
        const {request, response, requestName} = data

        t.deepEqual(requestName, 'captureScreen')
        assert.notEqual(response, undefined) // FIXME : err how to test for fake images ?

        t.end()
      })
  })
}
