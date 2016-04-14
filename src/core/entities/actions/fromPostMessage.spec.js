import assert from 'assert'
import Rx from 'rx'
const {just} = Rx.Observable

import fromPostMessage from './fromPostMessage'

describe('actionsFromPostMessage (entities)', () => {
  it('should return the correct hash of actions', function () {
    this.timeout(5000)

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

    assert.deepEqual(Object.keys(actions), expActions)
  })
})
