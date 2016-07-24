
import Rx from 'rx'
import { postMessageDriver } from './postMessageDriver'

/*describe('postMessageDriver', () => {
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
      t.end()
    }

    window.addEventListener('message', resultChecker, false)

    const outgoing$ = Rx.Observable.just({output: 42, somethingElse: 'cool'})
    const inputs$ = postMessageDriver(outgoing$)
  })
})*/
