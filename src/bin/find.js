#!/usr/bin/env node

'use strict'

// isGlobal has no use, make eslint happy
// but eslint complains for vars-on-top
// so ...
var isGlobal = require('./is-global') // eslint-disable-line no-unused-vars

var options = {
  getCurrentRules: ['current', 'c'],
  getPluginRules: ['plugin', 'p'],
  getAllAvailableRules: ['all-available', 'a'],
  getUnusedRules: ['unused', 'u'],
  n: ['no-error'],
  verbose: ['verbose', 'v'],
}

var argv = require('yargs')
  .boolean(Object.keys(options))
  .alias(options)
  .argv

var cli = require('../lib/cli-util')

var processExitCode = argv.u && !argv.n ? 1 : 0
var getRuleFinder = require('../lib/rule-finder')
var specifiedFile = argv._[0]

var ruleFinder = getRuleFinder(specifiedFile)
Object.keys(options).forEach(function findRules(option) {
  var rules
  var ruleFinderMethod = ruleFinder[option]
  if (argv[option] && ruleFinderMethod) {
    rules = ruleFinderMethod()
    argv.verbose && cli.push('\n' + options[option][0] + ' rules\n' + rules.length + ' rules found\n')
    if (rules.length) {
      !argv.verbose && cli.push('\n' + options[option][0] + ' rules\n')
      cli.push(rules)
      cli.write()
    } else /* istanbul ignore else */ if (option === 'getUnusedRules') {
      processExitCode = 0
    }
  }
})

if (processExitCode) {
  process.exit(processExitCode)
}
