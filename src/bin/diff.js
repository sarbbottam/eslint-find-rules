#!/usr/bin/env node

'use strict'

var path = require('path')

var cli = require('../lib/cli-util')

var getRuleFinder = require('../lib/rule-finder')
var difference = require('../lib/array-diff')
var getSortedRules = require('../lib/sort-rules')

var files = [process.argv[2], process.argv[3]]
var collectedRules = getFilesToCompare(files).map(compareConfigs)

var rulesCount = collectedRules.reduce(
  function getLength(prev, curr) {
    return prev + (curr && curr.rules ? curr.rules.length : /* istanbul ignore next */ 0)
  }, 0)

/* istanbul ignore next */
if (rulesCount) {
  cli.push('\ndiff rules\n')
  collectedRules.forEach(function displayConfigs(diff) {
    var rules = diff.rules

    if (!rules.length) {
      return
    }

    cli.push('\nin ' + diff.config1 + ' but not in ' + diff.config2 + ':\n')
    cli.push(rules)
  })
}

cli.write()

function getFilesToCompare(allFiles) {
  var filesToCompare = [allFiles]
  filesToCompare.push([].concat(allFiles).reverse())
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
  return getSortedRules(
    difference(
      a.getCurrentRules(),
      b.getCurrentRules()
    )
  )
}
