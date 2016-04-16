#!/usr/bin/env node

'use strict'

var options = {
  getCurrentRules: ['current', 'c'],
  getPluginRules: ['plugin', 'p'],
  getAllAvailableRules: ['all-available', 'a'],
  getUnusedRules: ['unused', 'u'],
  verbose: ['verbose', 'v'],
  n: ['no-error'],
}

var argv = require('yargs')
  .boolean(Object.keys(options))
  .alias(options)
  .argv

var size = require('window-size')
var availableWidth = size.width || /* istanbul ignore next */ 80
var ui = require('cliui')({width: availableWidth})

var processExitCode = argv.u && !argv.n ? 1 : 0
var getRuleFinder = require('../lib/rule-finder')
var specifiedFile = argv._[0]

var ruleFinder = getRuleFinder(specifiedFile)
Object.keys(options).forEach(function findRules(option) {
  var rules, outputRules, outputRuleCellMapper
  var outputPadding = ' '
  var outputMaxWidth = 0
  var outputMaxCols = 0
  var ruleFinderMethod = ruleFinder[option]
  if (argv[option] && ruleFinderMethod) {
    rules = ruleFinderMethod()
    argv.verbose && console.log( // eslint-disable-line no-console
      '\n' + options[option][0] + ' rules\n' + rules.length + ' rules found\n'
    )
    /* istanbul ignore next */
    if (rules.length) {
      !argv.verbose && console.log('\n' + options[option][0] + ' rules\n') // eslint-disable-line no-console
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
    } else if (option === 'getUnusedRules') {
      processExitCode = 0
    }
  }
})

if (processExitCode) {
  process.exit(processExitCode)
}

function getOutputRuleCellMapper(width) {
  return function curriedOutputRuleCellMapper(rule) {
    return {text: rule, width: width}
  }
}
