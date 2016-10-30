const assert = require('assert');
const stringifyRuleConfig = require('../../src/lib/stringify-rule-config');

describe('stringify rule config', () => {
  it('should return a string', () => {
    assert.equal(
      stringifyRuleConfig('A simple string'),
      'A simple string'
    );
  });

  it('should return \'-\' for "undefined"', () => {
    assert.equal(
      stringifyRuleConfig(undefined),
      '-'
    );
  });

  it('should return a JSON.stringify\'ed result for any object', () => {
    assert.deepEqual(
      stringifyRuleConfig([2, 'foo', {bar: true}]),
      JSON.stringify([2, 'foo', {bar: true}])
    );
  });
});
