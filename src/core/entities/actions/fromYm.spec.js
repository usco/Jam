import assert from 'assert'
import Rx from 'rx'
const {just, never} = Rx.Observable
import fromYm from './fromYm'
import fromEvents from './fromEvents'
import fromPostMessage from './fromPostMessage'

describe('actionsFromEvents', () => {
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

describe('actionsFromPostMessage', () => {
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

describe('actionsFromYm', () => {
  it('should return the correct hash of actions', function () {
    this.timeout(5000)

    function mockYmDriver () {
      return never()
    }

    const ym = mockYmDriver()
    const resources = never()
    const actions = fromYm({ym, resources})

    const expActions = [
      'addTypes$',
      'createMetaComponents$',
      'createTransformComponents$',
      'createMeshComponents$',
      'requests$',
      'setActiveAssembly$'
    ]

    assert.deepEqual(Object.keys(actions), expActions)
  })
})
