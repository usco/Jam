import assert from 'assert'
import Rx from 'rx'
const {just, never} = Rx.Observable
import {contains} from 'ramda'

import makeYMDriver from './index'

describe('youMagineDriver', () => {
  it('should handle data saving', function (done) {
    this.timeout(5000)
    const saveData = {
      design: {id: 1, synched: true},
      authData: {token: '42'}, // bom & parts
      bom: [{id: 0, qty: 2, phys_qty: 1}], // assemblies data
      eMetas: {id: 1, typeUid: 0, name: 'one'},
      eTrans: {id: 1, typeUid: 0, pos: [0, 0, 1], rot: [1, 1, 1], sca: [1, 1, 1]},
      eMeshs: {id: 1, typeUid: 0}
    }
    const saveData$ = just(saveData) // .shareReplay(30)
      .delay(1) // Hacky way of making it work see http://stackoverflow.com/questions/25634375/rxjs-only-the-first-observer-can-see-data-from-observable-share
      .share()

    const saveQuery$ = saveData$
      .map(function (data) {
        return {method: 'save', data, type: 'design'}
      })

    const fakeHttpDriver = function (outRequests$) {
      outRequests$
        .scan(function (acc, data) {
          acc.push(data)
          return acc
        }, [])
        .filter(d => d.length >= 3)
        .forEach(data => {
          // TODO: flesh these out ?
          assert.deepEqual(data[0].url, 'https://api.youmagine.com/v1/designs/1/parts/0/?auth_token=42')
          assert.deepEqual(data[0].method, 'put')
          assert.deepEqual(data[0].type, 'ymSave')
          assert.deepEqual(data[0].typeDetail, 'parts')

          assert.deepEqual(data[1].url, 'https://api.youmagine.com/v1/designs/1/bom/0/?auth_token=42')
          assert.deepEqual(data[1].method, 'put')
          assert.deepEqual(data[1].type, 'ymSave')
          assert.deepEqual(data[1].typeDetail, 'bom')

          assert.deepEqual(data[2].url, 'https://api.youmagine.com/v1/designs/1/assemblies/undefined/entries/undefined/?auth_token=42')
          assert.deepEqual(data[2].method, 'put')
          assert.deepEqual(data[2].type, 'ymSave')
          assert.deepEqual(data[2].typeDetail, 'assemblies')
          done()
      })
      return never()
    }

    const outgoing$ = saveQuery$
    const ymDriver = makeYMDriver(fakeHttpDriver)
    ymDriver(outgoing$)
  })

  it('should handle data loading', function (done) {
    const fakeHttpDriver = function (outRequests$) {
      const replyToAssemblies$ = outRequests$
        .filter(r => r.method === 'get' && r.typeDetail === 'assemblies')
        .map(function(data){
          let response$$ = just({response: [{uuid: 'xx'}] }).delay(1).share()
          response$$.request = {
            method: 'get',
            type: 'ymLoad',
            typeDetail: 'assemblies',
          }
          return response$$
        })

      return replyToAssemblies$.merge(outRequests$)
    }

    const loadData = {design:{id:0}, authData:'F00', apiEndpoint:'fake/url'}
    const loadDataQuery$ =  just({method: 'load', data:loadData, type: 'design'})
      .delay(1)
      .share()

    const ymDriver = makeYMDriver(fakeHttpDriver)
    const driverOutputs$ = ymDriver(loadDataQuery$).data

    driverOutputs$
      .scan(function (acc, data) {
        acc.push(data.typeDetail)
        return acc
      }, [])
      .filter(data => data.length >= 3)
      .map(function (data) {
        // we recieved all 3 types of data, we are gold !
        return (contains('parts', data) && contains('bom', data) && contains('assemblyEntries', data))
      })
      .forEach(function (output) {
        assert.equal(output, true)
        done()
      })

  })
/* it('should handle initiating loading',function(done){
  this.timeout(5000)

  const loadData = {
    design:{id:1, synched:true}
    ,authData:{token:'42'}
  }
  const loadData$ =   just(loadData)
    .delay(1) //Hacky way of making it work see http://stackoverflow.com/questions/25634375/rxjs-only-the-first-observer-can-see-data-from-observable-share
    .share()

  const loadQuery$ = loadData$
    .map(function(data){
      return {method:'load', data, type:'design'}
    })

  const fakeHttpDriver = function(outRequests$){
    outRequests$
      .toArray()
      .forEach(data => {
        //console.log("output message",data)
        const expData = [
          { url: 'https://api.youmagine.com/v1/designs/1/parts/?auth_token=42',
          method: 'get',
          type: 'ymLoad',
          typeDetail: 'parts',
          responseType: 'json' },
        { url: 'https://api.youmagine.com/v1/designs/1/bom/?auth_token=42',
          method: 'get',
          type: 'ymLoad',
          typeDetail: 'bom',
          responseType: 'json' }
        ]
        assert.deepEqual(data,expData)
      })
  }
  const outgoing$       = loadQuery$
  const ymDriver        = makeYMDriver(fakeHttpDriver)
  const driverOutputs$  = ymDriver(outgoing$)
})*/
})
