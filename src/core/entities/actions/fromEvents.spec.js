import assert from 'assert'
import Rx from 'rx'
const {just} = Rx.Observable
import fromEvents from './fromEvents'

describe('actionsFromEvents (entities)', () => {
  it('should return the correct hash of actions', function () {
    this.timeout(5000)

    const mockEventDriver = function () {
      return {
        select: () => ({events: () => just('')})
      }
    }
    const events = mockEventDriver()

    const actions = fromEvents(events)

    const expActions = [
      'addTypes$',
      'removeTypes$',
      'deleteInstances$',
      'updateComponent$',
      'createAnnotationStep$'
    ]

    assert.deepEqual(Object.keys(actions), expActions)
  })
})
