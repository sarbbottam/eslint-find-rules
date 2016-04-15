var assert = require('assert')
var sortRules = require('../../src/lib/sort-rules')

describe('sort-rules', function() {
  it('should return sorted rules', function() {
    assert.deepEqual(
      sortRules(['a', 'b', 'c']),
      ['a', 'b', 'c']
    )
    assert.deepEqual(
      sortRules(['c', 'b', 'a']),
      ['a', 'b', 'c']
    )
    assert.deepEqual(
      sortRules(['aa', 'a', 'ab', 'b', 'c']),
      ['a', 'aa', 'ab', 'b', 'c']
    )
  })
})
