import assert from 'assert'
import {extractChanges} from '../src/utils/diffPatchUtils'



describe('DiffPatch-utils', function() {
  describe('extractChanges', function() {

    it('should return an object, containing added & removed items ', function () {
      let previous = ["a","b","c"]
      let current  = ["b"]

      let result = extractChanges(previous,current)
      let expected = {added:[],removed:["a","c"],changed:[]}

      assert.equal( JSON.stringify(result), JSON.stringify(expected))

      //
      previous = []
      current  = ["b","a"]

      result = extractChanges(previous, current)
      expected = {added:["b","a"],removed:[],changed:[]}

      assert.equal( JSON.stringify(result), JSON.stringify(expected))

    })

  })
})