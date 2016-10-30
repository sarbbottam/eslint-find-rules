const assert = require('assert');

function difference(a, b) {
  const diff = {};

  Object.keys(a).forEach(compare(diff, a, b));
  Object.keys(b).forEach(compare(diff, a, b));

  return diff;
}

function compare(diff, a, b) {
  return n => {
    if (!diff[n]) {
      try {
        assert.deepEqual(a[n], b[n]);
      } catch (err) {
        diff[n] = {
          config1: a[n],
          config2: b[n]
        };
      }
    }
  };
}

module.exports = difference;
