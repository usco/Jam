import assert from 'assert'
import Rx from 'rx'
const {just, never} = Rx.Observable
import fromYm from './fromYm'

describe('actionsFromYm (BOM)', () => {
  it('should return the correct hash of actions', function () {
    function mockYmDriver () {
      return {data: never()}
    }

    const ym = mockYmDriver()
    const actions = fromYm(ym)

    const expActions = [
      'upsertBomEntries$'
    ]

    assert.deepEqual(Object.keys(actions), expActions)
  })

  function makeFakeReqRes (options) {
    const partsRequest = {
      method: 'get',
      type: 'ymLoad',
      typeDetail: options.typeDetail,
      assemblyId: 27
    }
    let response$$ = just({response: options.responseData}).delay(1).share()
    response$$.request = partsRequest

    return response$$
  }

  function mockYmDriver () {
    let bom$ = makeFakeReqRes({
      typeDetail: 'bom',
      responseData: [{part_uuid: 'xx9_9', part_version: '0.0.1', part_parameters: '', qty: 19, phys_qty: 27.6, unit: 'L'}]
    })
    return {data: Rx.Observable.from([bom$])}
  }

  it('should output correct data from its returned actions: (upsertBomEntries)', function (done) {
    const ym = mockYmDriver()
    const actions = fromYm(ym)

    const expData = [
      { id: 'xx9_9',
        data:
       { id: 'xx9_9',
         part_parameters: '',
         qty: 19,
         phys_qty: 27.6,
         unit: 'L' }
       }
    ]

    actions.upsertBomEntries$
      .forEach(function (data) {
        assert.deepEqual(data, expData)
        done()
      })
  })
})
