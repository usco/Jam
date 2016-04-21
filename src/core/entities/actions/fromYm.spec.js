import assert from 'assert'
import Rx from 'rx'
const {just, never} = Rx.Observable
import fromYm from './fromYm'

describe('actionsFromYm (entities)', () => {
  it('should return the correct hash of actions', function () {
    this.timeout(5000)

    function mockYmDriver () {
      return {
        data: never()
      }
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

  function makeFakeReqRes(options){
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
    let parts$ = makeFakeReqRes({
      typeDetail: 'parts',
      responseData: [{uuid: 9, name: 'partTypeA',binary_document_url:'some/fake/url'}]
    })
    let assemblyEntries$ = makeFakeReqRes({
      typeDetail: 'assemblyEntries',
      responseData: [{
        uuid: 0, part_uuid: 1, assemblyId: 27,
        name: 'test', color: 'red',
        pos: [0, 0.5, 8], rot: [19, 90, -75.5], sca: [1, 1, 1.5]
      }]
    })

    return {
      data: Rx.Observable.from([parts$, assemblyEntries$])
    }
  }

  it('should output correct data from its returned actions: (addTypes)', function (done){
    const ym = mockYmDriver()
    const resources = never()
    const actions = fromYm({ym, resources})

    const expData = {
      id: 9,
      data: undefined,
      meta:
       { id: 9,
         name: 'partTypeA',
         binary_document_url: 'some/fake/url'
       }
    }

    actions.addTypes$
      .forEach(function (addTypeData) {
        assert.deepEqual(addTypeData, expData)
        done()
      })
  })

  it('should output correct data from its returned actions: (createMetaComponents)', function (done) {
    const ym = mockYmDriver()
    const resources = never()
    const actions = fromYm({ym, resources})

    const expData = [ { id: 0, value: { name: 'test', color: 'red', id: 0, typeUid: 1, assemblyId: 27 } } ]

    actions.createMetaComponents$
      .forEach(function (data) {
        assert.deepEqual(data, expData)
        done()
      })
  })

  it('should output correct data from its returned actions: (createTransformComponents)', function (done) {
    const ym = mockYmDriver()
    const resources = never()
    const actions = fromYm({ym, resources})

    const expData = [ { id: 0,
      value:
     { name: 'test',
       id: 0,
       typeUid: 1,
       pos: [0, 0.5, 8], rot: [19, 90, -75.5], sca: [1, 1, 1.5]
     }
   }]

    actions.createTransformComponents$
      .forEach(function (data) {
        assert.deepEqual(data, expData)
        done()
      })
  })

  it('should output correct data from its returned actions: (setActiveAssembly)', function (done) {
    const ym = mockYmDriver()
    const resources = never()
    const actions = fromYm({ym, resources})

    const expData = 27

    actions.setActiveAssembly$
      .forEach(function (data) {
        assert.deepEqual(data, expData)
        done()
      })
  })

  it('should output correct data from its returned actions: (requests)', function (done) {
    const ym = mockYmDriver()
    const resources = never()
    const actions = fromYm({ym, resources})

    const expData = { src: 'http',
      method: 'get',
      uri: 'some/fake/url',
      url: 'some/fake/url',
      id: 9,
      type: 'resource',
      flags: 'noInfer' }

    actions.requests$
      .forEach(function (data) {
        assert.deepEqual(data, expData)
        done()
      })
  })

})
