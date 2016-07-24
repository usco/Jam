
import { isEmpty, getNameAndExtension } from './utils'

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

  describe('getNameAndExtension', () => {
    it('should return the name and the extension from a dotted string', function () {
      const input = 'foo.bar.STL'
      t.deepEqual(getNameAndExtension(input), {name: 'foo.bar.STL', ext: 'stl'})
    })
  })
})
