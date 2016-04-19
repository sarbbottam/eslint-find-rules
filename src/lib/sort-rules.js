'use strict'

function getSortedRules(rules) {
  return Array.isArray(rules) ? getSortedRulesArray(rules) : transformIntoSortedRulesArray(rules)
}

function getSortedRulesArray(rules) {
  return rules.sort(sortAlphabetically)
}

function transformIntoSortedRulesArray(rules) {
  var sortedRules = []

  Object.keys(rules)
    .sort(sortAlphabetically)
    .forEach(function mapRules(ruleName) {
      var rule = {}
      rule[ruleName] = rules[ruleName]
      sortedRules.push(rule)
    })

  return sortedRules
}

function sortAlphabetically(a, b) {
  return a > b ? 1 : -1
}

module.exports = getSortedRules
