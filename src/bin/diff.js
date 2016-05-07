#!/usr/bin/env node

'use strict'

var path = require('path')
var argv = require('yargs')
  .boolean('verbose')
  .alias('v', 'verbose')
  .argv

var cli = require('../lib/cli-util')

var getRuleFinder = require('../lib/rule-finder')
var arrayDifference = require('../lib/array-diff')
var objectDifference = require('../lib/object-diff')
var getSortedRules = require('../lib/sort-rules')
var flattenRulesDiff = require('../lib/flatten-rules-diff')
var stringifyRuleConfig = require('../lib/stringify-rule-config')

var files = [argv._[0], argv._[1]]
var collectedRules = getFilesToCompare(files).map(compareConfigs)

var rulesCount = collectedRules.reduce(
  function getLength(prev, curr) {
    return prev + (curr && curr.rules ? curr.rules.length : /* istanbul ignore next */ 0)
  }, 0)

/* istanbul ignore else */
if (argv.verbose || rulesCount) {
  cli.push('\ndiff rules\n' + rulesCount + ' rules differ\n')
}

/* istanbul ignore else */
if (rulesCount) {
  collectedRules.forEach(function displayConfigs(diff) {
    var rules = diff.rules

    /* istanbul ignore if */
    if (!rules.length) {
      return
    }

    if (argv.verbose) {
      rules = flattenRulesDiff(rules).map(stringifyRuleConfig)
      rules.unshift([], diff.config1, diff.config2)
    } else {
      cli.push('\nin ' + diff.config1 + ' but not in ' + diff.config2 + ':\n')
    }

    cli.push(rules, argv.verbose ? 3 : 0)
  })
}

cli.write()

function getFilesToCompare(allFiles) {
  var filesToCompare = [allFiles]

  if (!argv.verbose) {
    // in non-verbose output mode, compare a to b
    // and b to a afterwards, to obtain ALL differences
    // accross those files, but grouped
    filesToCompare.push([].concat(allFiles).reverse())
  }

  return filesToCompare
}

function compareConfigs(currentFiles) {
  return {
    config1: path.basename(currentFiles[0]),
    config2: path.basename(currentFiles[1]),
    rules: rulesDifference(
      getRuleFinder(currentFiles[0]),
      getRuleFinder(currentFiles[1])
    ),
  }
}

function rulesDifference(a, b) {
  if (argv.verbose) {
    return getSortedRules(
      objectDifference(
        a.getCurrentRulesDetailed(),
        b.getCurrentRulesDetailed()
      )
    )
  }

  return getSortedRules(
    arrayDifference(
      a.getCurrentRules(),
      b.getCurrentRules()
    )
  )
}
