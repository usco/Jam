import assert from 'assert'
import Rx from 'rx'
const {just} = Rx.Observable
import fromEvents from './fromEvents'

function mockEventsDriver () {
  return {
    select: () => ({events: () => just({id: 9, stuff: 'fakeData'}) })
  }
}

describe('actionsFromEvents (BOM)', () => {
  it('should return the correct hash of actions', function () {
    const events = mockEventsDriver()
    const actions = fromEvents(events)

    const expActions = [
      'updateBomEntries$',
      'upsertBomEntries$'
    ]

    assert.deepEqual(Object.keys(actions), expActions)
  })

  it('should output correct data from its returned actions: (upsertBomEntries)', function (done) {
    const events = mockEventsDriver()
    const actions = fromEvents(events)

    const expData = [{ id: 9, data: { id: 9, stuff: 'fakeData' } }]

    actions.upsertBomEntries$
      .forEach(function (data) {
        assert.deepEqual(data, expData)
        done()
      })
  })

  it('should output correct data from its returned actions: (updateBomEntries)', function (done) {
    const events = mockEventsDriver()
    const actions = fromEvents(events)

    const expData = [ { id: 9, stuff: 'fakeData' } ]

    actions.updateBomEntries$
      .forEach(function (data) {
        assert.deepEqual(data, expData)
        done()
      })
  })
})
