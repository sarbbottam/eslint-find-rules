import test from 'ava'

import difference from '../src/difference'

test('should return difference', (t) => {
  t.same(
    difference(['a', 'b', 'c'], ['x', 'y', 'z']),
    ['a', 'b', 'c']
  )
  t.same(
    difference(['a', 'b', 'c'], ['a', 'y', 'z']),
    ['b', 'c']
  )
  t.same(
    difference(['a', 'b', 'c'], ['a', 'b', 'z']),
    ['c']
  )

  t.same(
    difference(['a', 'b', 'c'], ['a', 'b', 'c']),
    []
  )
})
