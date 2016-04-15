#!/usr/bin/env node

'use strict'

var getRuleFinder = require('./rule-finder')
var difference = require('./difference')

var rules = difference(
  getRuleFinder(process.argv[2]).getCurrentRules(),
  getRuleFinder(process.argv[3]).getCurrentRules()
)

/* istanbul ignore next */
if (rules.length) {
  console.log('\n diff rules\n') // eslint-disable-line no-console
  console.log(rules.join(', ')) // eslint-disable-line no-console
}
