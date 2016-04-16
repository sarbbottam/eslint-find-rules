var assert = require('assert')

function difference(a, b) {
  var hash = {}
  var diff = []

  Object.keys(a).forEach(compare(hash, diff, a, b))
  Object.keys(b).forEach(compare(hash, diff, a, b))

  return diff
}

function compare(hash, diff, a, b) {
  return function curriedf(n) {
    if (!hash[n]) {
      hash[n] = true
      try {
        assert.deepEqual(a[n], b[n])
      } catch (e) {
        diff.push([n, a[n], b[n]])
      }
    }
  }
}

module.exports = difference
