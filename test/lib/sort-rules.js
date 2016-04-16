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

  it('should return sorted rule configs', function() {
    assert.deepEqual(
      sortRules([['a', ['b', 'c'], ['d', 'e']], ['b', ['c', 'd'], ['e', 'f']]]),
      [['a', ['b', 'c'], ['d', 'e']], ['b', ['c', 'd'], ['e', 'f']]]
    )
    assert.deepEqual(
      sortRules([['c', ['d', 'e'], ['f', 'g']], ['b', ['c'], 'd'], ['a', ['b', 'c'], undefined]]),
      [['a', ['b', 'c'], undefined], ['b', ['c'], 'd'], ['c', ['d', 'e'], ['f', 'g']]]
    )
  })
})
