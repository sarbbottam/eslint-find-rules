var assert = require('assert')
var flattenRulesDiff = require('../../src/lib/flatten-rules-diff')

describe('flatten rules diff', function() {
  it('should return flat array from diff-object with single rule', function() {
    assert.deepEqual(
      flattenRulesDiff({'foo-rule': {config1: [2, 'foo'], config2: [2, 'bar']}}),
      ['foo-rule', [2, 'foo'], [2, 'bar']]
    )
  })

  it('should return flat array from diff-object with multiple rules', function() {
    assert.deepEqual(
      flattenRulesDiff({
        'foo-rule': {config1: [2, 'foo'], config2: [2, 'bar']},
        'bar-rule': {config1: undefined, config2: [1, 'bar']},
      }),
      ['foo-rule', [2, 'foo'], [2, 'bar'], 'bar-rule', undefined, [1, 'bar']]
    )
  })

  it('should return flat array from an array of diff-objects', function() {
    assert.deepEqual(
      flattenRulesDiff([
        {'foo-rule': {config1: [2, 'foo'], config2: [2, 'bar']}},
        {'bar-rule': {config1: undefined, config2: [1, 'bar']}},
      ]),
      ['foo-rule', [2, 'foo'], [2, 'bar'], 'bar-rule', undefined, [1, 'bar']]
    )
  })

  it('should return empty array on anything else', function() {
    assert.deepEqual(
      flattenRulesDiff(undefined),
      []
    )
  })
})
