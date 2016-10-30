const assert = require('assert');
const difference = require('../../src/lib/array-diff');

describe('array difference', () => {
  it('should return difference', () => {
    assert.deepEqual(
      difference(['a', 'b', 'c'], ['x', 'y', 'z']),
      ['a', 'b', 'c']
    );
    assert.deepEqual(
      difference(['a', 'b', 'c'], ['a', 'y', 'z']),
      ['b', 'c']
    );
    assert.deepEqual(
      difference(['a', 'b', 'c'], ['a', 'b', 'z']),
      ['c']
    );
    assert.deepEqual(
      difference(['a', 'b', 'c'], ['a', 'b', 'c']),
      []
    );
  });
});
