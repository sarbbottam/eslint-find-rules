#!/usr/bin/env node

'use strict'

var path = require('path')
var argv = require('yargs')
  .boolean('verbose')
  .alias('v', 'verbose')
  .argv

var size = require('window-size')
var availableWidth = size.width || /* istanbul ignore next */ 80
var ui = require('cliui')({width: availableWidth})

var getRuleFinder = require('../lib/rule-finder')
var arrayDifference = require('../lib/array-diff')
var objectDifference = require('../lib/object-diff')
var getSortedRules = require('../lib/sort-rules')

var outputPadding = ' '
var outputMaxWidth = 0
var outputMaxCols = 0

var files = [argv._[0], argv._[1]]
var collectedRules = getFilesToCompare(files).map(compareConfigs)

var rulesCount = collectedRules.reduce(
  function getLength(prev, curr) {
    return prev + (curr && curr.rules ? curr.rules.length : /* istanbul ignore next */ 0)
  }, 0)

var outputRuleCellMapper

/* istanbul ignore next */
if (rulesCount) {
  console.log('\ndiff rules') // eslint-disable-line no-console

  outputMaxCols = argv.verbose ? 3 : Math.floor(availableWidth / outputMaxWidth)
  outputRuleCellMapper = getOutputRuleCellMapper(Math.floor(availableWidth / outputMaxCols))

  collectedRules.forEach(function displayConfigs(config) {
    var rules = config.rules

    if (!rules.length) {
      return
    }

    if (argv.verbose) {
      rules.unshift('', config.base, config.head)
    } else {
      console.log( // eslint-disable-line no-console
        '\nin ' + config.base + ' but not in ' + config.head + ':\n' +
        rules.length + ' rules found\n'
      )
    }

    while (rules.length) {
      ui.div.apply(
        ui,
        rules.splice(0, outputMaxCols).map(outputRuleCellMapper)
      )
    }
    console.log(ui.toString()) // eslint-disable-line no-console
  })
}

function getFilesToCompare(allFiles) {
  var filesToCompare = [allFiles]

  if (!argv.verbose) {
    // in non-verbose output mode, compare a to be
    // and b to a afterwards, to obtain ALL differences
    // across those files, but grouped
    filesToCompare.push([].concat(allFiles).reverse())
  }

  return filesToCompare
}

function compareConfigs(currentFiles) {
  var rules = rulesDifference(
    getRuleFinder(currentFiles[0]),
    getRuleFinder(currentFiles[1])
  )

  return {
    base: path.basename(currentFiles[0]),
    head: path.basename(currentFiles[1]),
    rules: rules.map(transformToColumnSpecification),
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

function transformToColumnSpecification(rule) {
  /* istanbul ignore if */
  if (typeof rule !== 'string') {
    rule = JSON.stringify(rule)
  }
  rule = rule + outputPadding
  outputMaxWidth = Math.max(rule.length, outputMaxWidth)
  return rule
}

function getOutputRuleCellMapper(width) {
  return function curriedOutputRuleCellMapper(rule) {
    return {text: rule, width: width}
  }
}
