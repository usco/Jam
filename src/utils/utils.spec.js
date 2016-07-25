import test from 'ava'
import { isEmpty, getNameAndExtension } from './utils'

test('utils: isEmpty: should determine if a string is empty', t => {
  const emptyInput = ''
  const notEmptyInput = 'foo'
  t.deepEqual(isEmpty(emptyInput), true)
  t.deepEqual(isEmpty(notEmptyInput), false)
})

test('utils: isEmpty: should not fail with a non string input ', t => {
  const input = {foo: 42}
  t.deepEqual(isEmpty(input), false)
})

test('utils: getNameAndExtension: should return the name and the extension from a dotted string', t => {
  const input = 'foo.bar.STL'
  t.deepEqual(getNameAndExtension(input), {name: 'foo.bar.STL', ext: 'stl'})
})
