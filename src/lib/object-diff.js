var assert = require('assert')

function difference(a, b) {
  var diff = {}

  var aKeys = Object.keys(a)
  var bKeys = Object.keys(b)

  function compare(n, index) {
    try {
      assert.deepEqual(a[n], b[n])
    } catch (e) {
      diff[n] = {
        config1: a[n],
        config2: b[n],
      }
      aKeys.splice(index, 0)
      bKeys.splice(index, 0)
    }
  }

  aKeys.forEach(compare)
  bKeys.forEach(compare)

  return diff
}

module.exports = difference
