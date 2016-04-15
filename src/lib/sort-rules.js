'use strict'

function getSortedRules(rules) {
  return rules.sort(function sort(a, b) {
    return a > b ? 1 : -1
  })
}

module.exports = getSortedRules
