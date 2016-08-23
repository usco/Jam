import test from 'ava'
import Rx from 'rx'
const {just} = Rx.Observable
import fromEvents from './fromEvents'

test('actionsFromEvents (entities): should return the correct hash of actions', t => {
  //this.timeout(5000)

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
    'createAnnotationStep$',
    'resetScaling$'
  ]

  t.deepEqual(Object.keys(actions), expActions)
})
