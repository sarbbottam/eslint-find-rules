#!/usr/bin/env node

'use strict'

var options = {
  getCurrentRules: ['current', 'c'],
  getPluginRules: ['plugin', 'p'],
  getAllAvailableRules: ['all-available', 'a'],
  getUnusedRules: ['unused', 'u'],
}

var argv = require('yargs')
  .boolean(Object.keys(options))
  .alias(options)
  .argv

var getRuleFinder = require('./rule-finder')
var specifiedFile = argv._[0]

var ruleFinder = getRuleFinder(specifiedFile)
Object.keys(options).forEach(function findRules(option) {
  var rules
  if (argv[option]) {
    rules = ruleFinder[option]()
    /* istanbul ignore next */
    if (rules.length) {
      console.log('\n' + options[option][0], 'rules\n') // eslint-disable-line no-console
      console.log(rules.join(', ')) // eslint-disable-line no-console
    }
  }
})
