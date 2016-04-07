import assert from 'assert'
import Rx from 'rx'
import { postMessageDriver } from './postMessageDriver'

describe('postMessageDriver', () => {
  /*beforeEach(function(done) {
      o = {
          f: function() {
              o.f2()
          },
          f2: function() {}
      }
      window.addEventListener('message', o.f, false)
      spyOn(o, 'f2').and.callFake(function() {
          done()
      })
      window.postMessage('another bam', '*')
  })*/

  /*it('can recieve inputs', () => {
      //expect(o.f2).toHaveBeenCalled()
  })*/

  it('should return incoming requests as stream', (done) => {
    const outgoing$ = Rx.Observable.just(undefined)
    const driver = postMessageDriver(outgoing$)

    const input$ = driver
      .forEach(message => {
        console.log('input message', message)
      })

    window.postMessage({test: true}, '*')
  })

  it('should dispatch outgoing data through the postMessage api', (done) => {

    function resultChecker (message) {
      window.removeEventListener('message', resultChecker)

      assert.equal(message, 864)
      done()
    }

    window.addEventListener('message', resultChecker, false)

    const outgoing$ = Rx.Observable.just({output: 42, somethingElse: 'cool'})
    const inputs$ = postMessageDriver(outgoing$)
  })
})
