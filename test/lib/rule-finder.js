var path = require('path')
var assert = require('assert')
var proxyquire = require('proxyquire')

var processCwd = process.cwd

var getRuleFinder = proxyquire('../../src/lib/rule-finder', {
  fs: {
    readdirSync: function() {
      return ['.eslintrc.yml', 'foo-rule.js', 'bar-rule.js', 'baz-rule.js']
    },
  },
  'eslint-plugin-plugin': {
    rules: {
      'foo-rule': true,
      'bar-rule': true,
      'baz-rule': true,
    },
    '@noCallThru': true,
    '@global': true,
  },
  'eslint-plugin-no-rules': {
    processors: {},
    '@noCallThru': true,
    '@global': true,
  },
  '@scope/eslint-plugin-scoped-plugin': {
    rules: {
      'foo-rule': true,
      'bar-rule': true,
    },
    '@noCallThru': true,
    '@global': true,
  },
})

var noSpecifiedFile = path.resolve(process.cwd(), './test/fixtures/no-path')
var specifiedFileRelative = './test/fixtures/eslint.json'
var specifiedFileAbsolute = path.join(process.cwd(), specifiedFileRelative)
var noRulesFile = path.join(process.cwd(), './test/fixtures/eslint-with-plugin-with-no-rules.json')

describe('rule-finder', function() {
  afterEach(function() {
    process.cwd = processCwd
  })

  it('no specifiedFile is passed to the constructor', function() {
    var ruleFinder
    process.cwd = function() {
      return noSpecifiedFile
    }
    ruleFinder = getRuleFinder()
    assert.deepEqual(ruleFinder.getUnusedRules(), ['bar-rule', 'baz-rule'])
  })

  it('no specifiedFile - current rules', function() {
    var ruleFinder
    process.cwd = function() {
      return noSpecifiedFile
    }
    ruleFinder = getRuleFinder()
    assert.deepEqual(ruleFinder.getCurrentRules(), ['foo-rule'])
  })

  it('no specifiedFile - current rule config', function() {
    var ruleFinder
    process.cwd = function() {
      return noSpecifiedFile
    }
    ruleFinder = getRuleFinder()
    assert.deepEqual(ruleFinder.getCurrentRulesDetailed(), {'foo-rule': [2]})
  })

  it('no specifiedFile - plugin rules', function() {
    var ruleFinder
    process.cwd = function() {
      return noSpecifiedFile
    }
    ruleFinder = getRuleFinder()
    assert.deepEqual(ruleFinder.getPluginRules(), [])
  })

  it('no specifiedFile - all available rules', function() {
    var ruleFinder
    process.cwd = function() {
      return noSpecifiedFile
    }
    ruleFinder = getRuleFinder()
    assert.deepEqual(ruleFinder.getAllAvailableRules(), ['bar-rule', 'baz-rule', 'foo-rule'])
  })

  it('no specifiedFile - all available rules without core', function() {
    var ruleFinder
    process.cwd = function() {
      return noSpecifiedFile
    }
    ruleFinder = getRuleFinder(null, true)
    assert.deepEqual(ruleFinder.getAllAvailableRules(), [])
  })

  it('specifiedFile (relative path) is passed to the constructor', function() {
    var ruleFinder = getRuleFinder(specifiedFileRelative)
    assert.deepEqual(ruleFinder.getUnusedRules(), [
      'baz-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'scoped-plugin/bar-rule',
    ])
  })

  it('specifiedFile (relative path) - current rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileRelative)
    assert.deepEqual(ruleFinder.getCurrentRules(), ['bar-rule', 'foo-rule', 'scoped-plugin/foo-rule'])
  })

  it('specifiedFile (relative path) - current rule config', function() {
    var ruleFinder = getRuleFinder(specifiedFileRelative)
    assert.deepEqual(ruleFinder.getCurrentRulesDetailed(), {
      'bar-rule': [2],
      'foo-rule': [2],
      'scoped-plugin/foo-rule': [2],
    })
  })

  it('specifiedFile (relative path) - plugin rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileRelative)
    assert.deepEqual(ruleFinder.getPluginRules(), [
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'scoped-plugin/bar-rule',
      'scoped-plugin/foo-rule',
    ])
  })

  it('specifiedFile (relative path) - all available rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileRelative)
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      [
        'bar-rule',
        'baz-rule',
        'foo-rule',
        'plugin/bar-rule',
        'plugin/baz-rule',
        'plugin/foo-rule',
        'scoped-plugin/bar-rule',
        'scoped-plugin/foo-rule',
      ]
    )
  })

  it('specifiedFile (relative path) - all available rules without core', function() {
    var ruleFinder = getRuleFinder(specifiedFileRelative, true)
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      [
        'plugin/bar-rule',
        'plugin/baz-rule',
        'plugin/foo-rule',
        'scoped-plugin/bar-rule',
        'scoped-plugin/foo-rule',
      ]
    )
  })

  it('specifiedFile (absolute path) is passed to the constructor', function() {
    var ruleFinder = getRuleFinder(specifiedFileAbsolute)
    assert.deepEqual(ruleFinder.getUnusedRules(), [
      'baz-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'scoped-plugin/bar-rule',
    ])
  })

  it('specifiedFile (absolute path) - current rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileAbsolute)
    assert.deepEqual(ruleFinder.getCurrentRules(), ['bar-rule', 'foo-rule', 'scoped-plugin/foo-rule'])
  })

  it('specifiedFile (absolute path) - current rule config', function() {
    var ruleFinder = getRuleFinder(specifiedFileAbsolute)
    assert.deepEqual(ruleFinder.getCurrentRulesDetailed(), {
      'foo-rule': [2],
      'bar-rule': [2],
      'scoped-plugin/foo-rule': [2],
    })
  })

  it('specifiedFile (absolute path) - plugin rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileAbsolute)
    assert.deepEqual(ruleFinder.getPluginRules(), [
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'scoped-plugin/bar-rule',
      'scoped-plugin/foo-rule',
    ])
  })

  it('specifiedFile (absolute path) - all available rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileAbsolute)
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      [
        'bar-rule',
        'baz-rule',
        'foo-rule',
        'plugin/bar-rule',
        'plugin/baz-rule',
        'plugin/foo-rule',
        'scoped-plugin/bar-rule',
        'scoped-plugin/foo-rule',
      ]
    )
  })

  it('specifiedFile (absolute path) without rules - plugin rules', function() {
    var ruleFinder = getRuleFinder(noRulesFile)
    assert.deepEqual(ruleFinder.getPluginRules(), [
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
    ])
  })
})
