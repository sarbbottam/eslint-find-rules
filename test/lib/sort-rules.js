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
      sortRules({'bar-rule': {config1: '1', config2: '2'}, 'baz-rule': {config1: '3', config2: '4'}}),
      [{'bar-rule': {config1: '1', config2: '2'}}, {'baz-rule': {config1: '3', config2: '4'}}]
    )
    assert.deepEqual(
      sortRules({'foo-rule': {config1: '1', config2: '2'}, 'bar-rule': {config1: '3', config2: '4'}}),
      [{'bar-rule': {config1: '3', config2: '4'}}, {'foo-rule': {config1: '1', config2: '2'}}]
    )
  })
})
