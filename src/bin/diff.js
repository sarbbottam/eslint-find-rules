#!/usr/bin/env node

'use strict'

var size = require('window-size')
var availableWidth = size.width || /* istanbul ignore next */ 80
var ui = require('cliui')({width: availableWidth})

var getRuleFinder = require('../lib/rule-finder')
var difference = require('../lib/array-diff')
var getSortedRules = require('../lib/sort-rules')

var rules = getSortedRules(
  difference(
    getRuleFinder(process.argv[2]).getCurrentRules(),
    getRuleFinder(process.argv[3]).getCurrentRules()
  )
)

var outputRules, outputRuleCellMapper
var outputPadding = ' '
var outputMaxWidth = 0
var outputMaxCols = 0

/* istanbul ignore next */
if (rules.length) {
  console.log('\n diff rules\n') // eslint-disable-line no-console
  rules = rules.map(function columnSpecification(rule) {
    rule = rule + outputPadding
    outputMaxWidth = Math.max(rule.length, outputMaxWidth)
    return rule
  })
  outputMaxCols = Math.floor(availableWidth / outputMaxWidth)
  outputRuleCellMapper = getOutputRuleCellMapper(Math.floor(availableWidth / outputMaxCols))
  while (rules.length) {
    outputRules = rules.splice(0, outputMaxCols).map(outputRuleCellMapper)
    ui.div.apply(ui, outputRules)
  }
  console.log(ui.toString()) // eslint-disable-line no-console
}

function getOutputRuleCellMapper(width) {
  return function curriedOutputRuleCellMapper(rule) {
    return {text: rule, width: width}
  }
}
