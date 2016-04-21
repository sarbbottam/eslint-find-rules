var assert = require('assert')
var stringifyRuleConfig = require('../../src/lib/stringify-rule-config')

describe('stringify rule config', function() {
  it('should return a string', function() {
    assert.equal(
      stringifyRuleConfig('A simple string'),
      'A simple string'
    )
  })

  it('should return \'-\' for "undefined"', function() {
    assert.equal(
      stringifyRuleConfig(undefined),
      '-'
    )
  })

  it('should return a JSON.stringify\'ed result for any object', function() {
    assert.deepEqual(
      stringifyRuleConfig([2, 'foo', {bar: true}]),
      JSON.stringify([2, 'foo', {bar: true}])
    )
  })
})
