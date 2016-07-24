import test from 'ava'
import Rx from 'rx'
const {just} = Rx.Observable
import fromEvents from './fromEvents'

function mockEventsDriver () {
  return {
    select: () => ({ events: () => just({id: 9, stuff: 'fakeData'}) })
  }
}

test('actionsFromEvents (BOM): should return the correct hash of actions', t => {
  const events = mockEventsDriver()
  const actions = fromEvents(events)

  const expActions = [
    'updateBomEntries$',
    'upsertBomEntries$'
  ]

  t.deepEqual(Object.keys(actions), expActions)
})

test.cb('actionsFromEvents (BOM): should output correct data from its returned actions: (upsertBomEntries)', t => {
  const events = mockEventsDriver()
  const actions = fromEvents(events)

  const expData = [{ id: 9, data: { id: 9, stuff: 'fakeData' } }]

  actions.upsertBomEntries$
    .forEach(function (data) {
      t.deepEqual(data, expData)
      t.end()
    })
})

test.cb('actionsFromEvents (BOM): should output correct data from its returned actions: (updateBomEntries)', t => {
  const events = mockEventsDriver()
  const actions = fromEvents(events)

  const expData = [ { id: 9, stuff: 'fakeData' } ]

  actions.updateBomEntries$
    .forEach(function (data) {
      t.deepEqual(data, expData)
      t.end()
    })
})
