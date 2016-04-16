'use strict'

function getSortedRules(rules) {
  return rules.sort(function sort(a, b) {
    var first, second

    if (typeof a === 'string' && typeof b === 'string') {
      first = a
      second = b
    } else {
      first = a[0]
      second = b[0]
    }

    return first > second ? 1 : -1
  })
}

module.exports = getSortedRules
