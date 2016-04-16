var assert = require('assert')
var difference = require('../../src/lib/array-diff')

describe('difference', function() {
  it('should return difference', function() {
    assert.deepEqual(
      difference(['a', 'b', 'c'], ['x', 'y', 'z']),
      ['a', 'b', 'c', 'x', 'y', 'z']
    )
    assert.deepEqual(
      difference(['a', 'b', 'c'], ['a', 'y', 'z']),
      ['b', 'c', 'y', 'z']
    )
    assert.deepEqual(
      difference(['a', 'b', 'c'], ['a', 'b', 'z']),
      ['c', 'z']
    )

    assert.deepEqual(
      difference(['a', 'b', 'c'], ['a', 'b', 'c']),
      []
    )
  })
})
