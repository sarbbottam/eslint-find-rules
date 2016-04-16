var assert = require('assert')
var difference = require('../../src/lib/object-diff')

describe('object difference', function() {
  it('should return difference', function() {
    assert.deepEqual(
      difference({a: ['a', 'b', 'c']}, {a: ['x', 'y', 'z']}),
      [['a', ['a', 'b', 'c'], ['x', 'y', 'z']]]
    )
    assert.deepEqual(
      difference({a: ['a', 'b', 'c']}, {a: 'a'}),
      [['a', ['a', 'b', 'c'], 'a']]
    )
    assert.deepEqual(
      difference({a: ['a', 'b', 'c']}, {b: ['a', 'b', 'c']}),
      [['a', ['a', 'b', 'c'], undefined], ['b', undefined, ['a', 'b', 'c']]]
    )

    assert.deepEqual(
      difference({a: ['a', 'b', 'c']}, {a: ['a', 'b', 'c']}),
      []
    )
  })
})
