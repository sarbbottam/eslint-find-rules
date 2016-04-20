#!/usr/bin/env node

'use strict'

var cli = require('../lib/cli-util')

var getRuleFinder = require('../lib/rule-finder')
var difference = require('../lib/array-diff')
var getSortedRules = require('../lib/sort-rules')

var rules = getSortedRules(
  difference(
    getRuleFinder(process.argv[2]).getCurrentRules(),
    getRuleFinder(process.argv[3]).getCurrentRules()
  )
)

/* istanbul ignore next */
if (rules.length) {
  cli.push('\ndiff rules\n')
  cli.push(rules)
}

cli.write()
