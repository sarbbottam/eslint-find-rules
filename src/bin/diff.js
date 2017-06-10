#!/usr/bin/env node

'use strict';

const path = require('path');
const argv = require('yargs')
  .boolean('verbose')
  .alias('v', 'verbose')
  .argv;

const cli = require('../lib/cli-util');

const getRuleFinder = require('../lib/rule-finder');
const arrayDifference = require('../lib/array-diff');
const objectDifference = require('../lib/object-diff');
const getSortedRules = require('../lib/sort-rules');
const flattenRulesDiff = require('../lib/flatten-rules-diff');
const stringifyRuleConfig = require('../lib/stringify-rule-config');

const files = [argv._[0], argv._[1]];
const collectedRules = getFilesToCompare(files).map(compareConfigs);

const rulesCount = collectedRules.reduce(
  (prev, curr) => {
    return prev + (curr && curr.rules ? curr.rules.length : /* istanbul ignore next */ 0);
  }, 0);

/* istanbul ignore else */
if (argv.verbose || rulesCount) {
  cli.push('\ndiff rules\n' + rulesCount + ' rules differ\n');
}

/* istanbul ignore else */
if (rulesCount) {
  collectedRules.forEach(diff => {
    let rules = diff.rules;

    /* istanbul ignore if */
    if (rules.length < 1) {
      return;
    }

    if (argv.verbose) {
      rules = flattenRulesDiff(rules).map(stringifyRuleConfig);
      rules.unshift([], diff.config1, diff.config2);
    } else {
      cli.push('\nin ' + diff.config1 + ' but not in ' + diff.config2 + ':\n');
    }

    cli.push(rules, argv.verbose ? 3 : 0);
  });
}

cli.write();

function getFilesToCompare(allFiles) {
  const filesToCompare = [allFiles];

  if (!argv.verbose) {
    // In non-verbose output mode, compare a to b
    // and b to a afterwards, to obtain ALL differences
    // accross those files, but grouped
    filesToCompare.push([].concat(allFiles).reverse());
  }

  return filesToCompare;
}

function compareConfigs(currentFiles) {
  return {
    config1: path.basename(currentFiles[0]),
    config2: path.basename(currentFiles[1]),
    rules: rulesDifference(
      getRuleFinder(currentFiles[0]),
      getRuleFinder(currentFiles[1])
    )
  };
}

function rulesDifference(a, b) {
  if (argv.verbose) {
    return getSortedRules(
      objectDifference(
        a.getCurrentRulesDetailed(),
        b.getCurrentRulesDetailed()
      )
    );
  }

  return getSortedRules(
    arrayDifference(
      a.getCurrentRules(),
      b.getCurrentRules()
    )
  );
}
