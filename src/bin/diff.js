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

var rules = rulesDifference(
  getRuleFinder(argv._[0]),
  getRuleFinder(argv._[1])
)

var outputRules, outputRuleCellMapper
var outputPadding = ' '
var outputMaxWidth = 0
var outputMaxCols = 0

argv.verbose && console.log( // eslint-disable-line no-console
  '\ndiff rules\n' + rules.length + ' rules found\n'
)
/* istanbul ignore next */
if (rules.length) {
  if (argv.verbose) {
    rules = [].concat.apply([], rules)
    rules.unshift('', path.basename(argv._[0]), path.basename(argv._[1]))
  } else {
    console.log('\ndiff rules\n') // eslint-disable-line no-console
  }
  rules = rules.map(function columnSpecification(rule) {
    if (typeof rule !== 'string') {
      rule = JSON.stringify(rule)
    }
    rule += outputPadding
    outputMaxWidth = Math.max(rule.length, outputMaxWidth)
    return rule
  })
  outputMaxCols = argv.verbose ? 3 : Math.floor(availableWidth / outputMaxWidth)
  outputRuleCellMapper = getOutputRuleCellMapper(Math.floor(availableWidth / outputMaxCols))
  while (rules.length) {
    outputRules = rules.splice(0, outputMaxCols).map(outputRuleCellMapper)
    ui.div.apply(ui, outputRules)
  }
  console.log(ui.toString()) // eslint-disable-line no-console
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

function getOutputRuleCellMapper(width) {
  return function curriedOutputRuleCellMapper(rule) {
    return {text: rule, width: width}
  }
}
