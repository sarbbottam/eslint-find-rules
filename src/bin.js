#!/usr/bin/env node

'use strict'

var options = {
  getCurrentRules: ['current', 'c'],
  getPluginRules: ['plugin', 'p'],
  getAllAvailableRules: ['all-available', 'a'],
  getUnusedRules: ['unused', 'u'],
  n: ['no-error'],
}

var argv = require('yargs')
  .boolean(Object.keys(options))
  .alias(options)
  .argv

var processExitCode = argv.u && !argv.n ? 1 : 0
var getRuleFinder = require('./rule-finder')
var specifiedFile = argv._[0]

var ruleFinder = getRuleFinder(specifiedFile)
Object.keys(options).forEach(function findRules(option) {
  var rules
  var ruleFinderMethod = ruleFinder[option]
  if (argv[option] && ruleFinderMethod) {
    rules = ruleFinderMethod()
    /* istanbul ignore next */
    if (rules.length) {
      console.log('\n' + options[option][0], 'rules\n') // eslint-disable-line no-console
      console.log(rules.join(', ')) // eslint-disable-line no-console
    }
  }
})

if (processExitCode) {
  process.exit(processExitCode)
}
