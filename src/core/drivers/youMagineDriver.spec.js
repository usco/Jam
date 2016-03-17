import assert from 'assert'
import Rx from 'rx'
const {just} = Rx.Observable
import makeYMDriver from './youMagineDriver'

//TODO: implement
describe('youMagineDriver', () => {

    it('should handle data saving',function(done){
      this.timeout(5000)
      const saveData   = {
        bom: [{id:0, qty:2, phys_qty:1}]

        ,design:{id:1, synched:true}
        ,authData:{token:'42'}

        , eMetas: {id:1,typeUid:0, name:'one'}
        , eTrans: {id:1,typeUid:0, pos:[0,0,1], rot:[1,1,1], sca:[1,1,1]}
        , eMeshs: {id:1,typeUid:0}
      }
      /*      const bom = [{id:0, qty:2, phys_qty:1}]
            const design = {id:1, synched:true}
            const authData = {token:'42'}
            const eMetas = {id:1,typeUid:0, name:'one'}
            const eTrans = {id:1,typeUid:0, pos:[0,0,1], rot:[1,1,1], sca:[1,1,1]}
            const eMeshs = {id:1,typeUid:0}

            const saveData$ = combineLatestObj({
              design: just(design),
              authData: just(authData),
              bom: just(bom),
              eMetas:just(eMetas),
              eTrans:just(eTrans),
              eMeshs:just(eMeshs)
            }).share()

            saveData$.forEach(e=>console.log("saveData",e))*/



      const saveData$ = just(saveData).shareReplay(3)

      const saveQuery$ = saveData$
        .map(function(data){
          return {method:'save', data, type:'design'}
        })

      const fakeHttpDriver = function(outRequests$){
        outRequests$
          .forEach(message => {
            console.log("output message",message)
          })
      }


      const outgoing$       = saveQuery$
      const ymDriver        = makeYMDriver(fakeHttpDriver)
      const driverOutputs$  = ymDriver(outgoing$)

      console.log("driverOutputs",driverOutputs$)
        //assert.equal(message,864)
        //done()
    })

    /*it('should handle initiating loading',function(done){
      this.timeout(5000)

      const loadData = {
        design:{id:1, synched:true}
        ,authData:{token:'42'}
      }
      const loadQuery$ = just(loadData)
        .map(function(data){
          return {method:'load', data, type:'design'}
        })

      const fakeHttpDriver = function(outRequests$){
        outRequests$
          .forEach(message => {
            console.log("output message",message)
          })
      }
      const outgoing$       = loadQuery$
      const ymDriver        = makeYMDriver(fakeHttpDriver)
      const driverOutputs$  = ymDriver(outgoing$)
    })*/

})
