var assert = require('assert')
var difference = require('../../src/lib/object-diff')

describe('object difference', function() {
  it('should return difference', function() {
    assert.deepEqual(
      difference({'foo-rule': [2, 'foo']}, {'foo-rule': [2, 'bar']}),
      {'foo-rule': {config1: [2, 'foo'], config2: [2, 'bar']}}
    )
    assert.deepEqual(
      difference({'foo-rule': [2, 'foo', 'bar']}, {'foo-rule': 2}),
      {'foo-rule': {config1: [2, 'foo', 'bar'], config2: 2}}
    )
    assert.deepEqual(
      difference({'foo-rule': [0, 'foo']}, {'bar-rule': [1, 'bar']}),
      {
        'foo-rule': {config1: [0, 'foo'], config2: undefined},
        'bar-rule': {config1: undefined, config2: [1, 'bar']},
      }
    )

    assert.deepEqual(
      difference({'foo-rule': [1, 'foo', 'bar']}, {'foo-rule': [1, 'foo', 'bar']}),
      {}
    )
  })
})
