import test from 'ava'
import Rx from 'rx'
const {just} = Rx.Observable

import fromPostMessage from './fromPostMessage'

test('actionsFromPostMessage (entities): should return the correct hash of actions', t => {
  //this.timeout(5000)

  const mockPostMessageDriver = function () {
    return just('')
  }
  const pm = mockPostMessageDriver()

  const actions = fromPostMessage(pm)

  const expActions = [
    'addPartData$',
    'removePartData$',
    'removeTypes$',
    'deleteInstances$',
    'desktopRequests$'
  ]

  t.deepEqual(Object.keys(actions), expActions)
})
