import assert from 'assert'
import Rx from 'rx'
const of = Rx.Observable.of
const never = Rx.Observable.never
import api from './api'

describe("api", function() {

  it('should return transforms when requested', (done) => {

    const actions = {
      apiActions:{
        getTransforms$: of(undefined)
        ,getStatus$:never()
        ,captureScreen$:never()
      }
    }

    const state$ = of({
      transforms:{
        "key":{pos:[0,0,1],rot:[0,1,2.5],sca:[1,1,1.25]}
      }
    })

    api(actions, state$)
      .outputs$
      .forEach(function(data) {
        const {request, response, requestName} = data

        assert.strictEqual(requestName,"getTransforms")
        assert.strictEqual(response.length,1)
        assert.deepEqual(response[0].pos, [0,0,1])
        assert.deepEqual(response[0].rot, [0,1,2.5])
        assert.deepEqual(response[0].sca, [1,1,1.25])

        done()
      })
  })

  it('should return status when requested', (done) => {

    const actions = {
      apiActions:{
        getTransforms$: never()
        ,getStatus$:of(undefined)
        ,captureScreen$:never()
      }
    }

    const state$ = of({
      settings:{
        activeTool:"hat"
      }
    })

    api(actions, state$)
      .outputs$
      .forEach(function(data) {
        const {request, response, requestName} = data

        assert.strictEqual(requestName,"getStatus")
        assert.deepEqual(response,{activeTool:"hat"})

        done()
      })
  })


  //TODO: do this better ?
  if(typeof(document) !== "undefined"){

    it('should capture screen when requested', (done) => {

      const actions = {
        apiActions:{
          getTransforms$: never()
          ,getStatus$:never()
          ,captureScreen$:of({
            request : "captureScreen"
            ,element : document.createElement("div")
          })
        }
      }

      const state$ = of({})

      api(actions, state$)
        .outputs$
        .forEach(function(data) {
          const {request, response, requestName} = data

          assert.strictEqual(requestName,"captureScreen")
          assert.notEqual(response,undefined) //FIXME : err how to test for fake images ?

          done()
        })
    })
  }



})
