
import { extractChangesBetweenArrays } from './diffPatchUtils'

describe('diffPatchUtils', function () {
  describe('extractChangesBetweenArrays', () => {
    it('should determine if there was a addition', function () {
      const previous = [{name: 'foo'}]
      const current = [{name: 'foo'}, {name: 'bar'}]

      const changes = extractChangesBetweenArrays(previous, current)
      const expChanges = {'added': [{name: 'bar'}], 'removed': [], 'changed': [], 'upserted': []}

      console.log('changes', changes)
      t.deepEqual(changes, expChanges)
    })

    it('should determine if there was a removal', function () {
      const previous = [{name: 'foo'}, {name: 'bar'}]
      const current = [{name: 'foo'}]

      const changes = extractChangesBetweenArrays(previous, current)
      const expChanges = {'added': [], 'removed': [{name: 'bar'}], 'changed': [], 'upserted': []}

      t.deepEqual(changes, expChanges)
    })

    /* it("should determine if there was an update", function() {
      const previous = [{name:'foo',id:0},{name:'bar',id:1}]
      const current  = [{name:'foobar',id:0},{name:'bar',id:1}]

      const changes  = extractChangesBetweenArrays(previous, current)
      const expChanges = {'added':[],'removed':[],'changed':[],'upserted':[{name:'foobar',id:0}]}

      console.log("changes",changes)
      assert.strictEqual(changes, expChanges)
    })*/
  })
})
