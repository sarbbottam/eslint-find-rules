#!/usr/bin/env node

'use strict'

var path = require('path')

var size = require('window-size')
var availableWidth = size.width || /* istanbul ignore next */ 80
var ui = require('cliui')({width: availableWidth})

var getRuleFinder = require('../lib/rule-finder')
var arrayDifference = require('../lib/array-diff')
var getSortedRules = require('../lib/sort-rules')

var outputPadding = ' '
var outputMaxWidth = 0
var outputMaxCols = 0

var files = [process.argv[2], process.argv[3]]
var collectedRules = [files, [].concat(files).reverse()].map(
  function diffConfigs(currentFiles) {
    var rules = getSortedRules(
      arrayDifference(
        getRuleFinder(currentFiles[0]).getCurrentRules(),
        getRuleFinder(currentFiles[1]).getCurrentRules()
      )
    ).map(function columnSpecification(rule) {
      rule = rule + outputPadding
      outputMaxWidth = Math.max(rule.length, outputMaxWidth)
      return rule
    })

    return {
      base: path.basename(currentFiles[0]),
      head: path.basename(currentFiles[1]),
      rules: rules,
    }
  })

var rulesCount = collectedRules.reduce(
  function getLength(prev, curr) {
    return prev + (curr && curr.rules ? curr.rules.length : /* istanbul ignore next */ 0)
  }, 0)

var outputRuleCellMapper

/* istanbul ignore next */
if (rulesCount) {
  console.log('\ndiff rules') // eslint-disable-line no-console

  outputMaxCols = Math.floor(availableWidth / outputMaxWidth)
  outputRuleCellMapper = getOutputRuleCellMapper(Math.floor(availableWidth / outputMaxCols))

  collectedRules.forEach(function displayConfigs(config) {
    var rules = config.rules

    if (!rules.length) {
      return
    }

    console.log( // eslint-disable-line no-console
      '\nin ' + config.base + ' but not in ' + config.head + ':\n' +
      rules.length + ' rules found\n'
    )
    while (rules.length) {
      ui.div.apply(
        ui,
        rules.splice(0, outputMaxCols).map(outputRuleCellMapper)
      )
    }
    console.log(ui.toString()) // eslint-disable-line no-console
  })
}

function getOutputRuleCellMapper(width) {
  return function curriedOutputRuleCellMapper(rule) {
    return {text: rule, width: width}
  }
}
