import assert from 'assert'
import { isEmpty } from './utils'

describe('utils', function () {
  describe('isEmpty', () => {
    it('should determine if a string is empty', function () {
      const emptyInput = ''
      const notEmptyInput = 'foo'
      assert.strictEqual(isEmpty(emptyInput), true)
      assert.strictEqual(isEmpty(notEmptyInput), false)
    })

    it('should not fail with a non string input ', function () {
      const input = {foo: 42}
      assert.strictEqual(isEmpty(input), false)
    })
  })
})
