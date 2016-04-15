var path = require('path')
var assert = require('assert')
var proxyquire = require('proxyquire')

var processCwd = process.cwd

var getRuleFinder = proxyquire('../../src/lib/rule-finder', {
  fs: {
    readdirSync: function() {
      return ['foo-rule.js', 'bar-rule.js', 'baz-rule.js']
    },
  },
  'eslint-plugin-react': {
    rules: {
      'foo-rule': true,
      'bar-rule': true,
      'baz-rule': true,
    },
    '@noCallThru': true,
    '@global': true,
  },
})

var noSpecifiedFile = path.resolve(process.cwd(), './test/fixtures/no-path')
var specifiedFileRelative = './test/fixtures/eslint.json'
var specifiedFileAbsolute = path.join(process.cwd(), specifiedFileRelative)

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

  it('no specifiedFile - curent rules', function() {
    var ruleFinder
    process.cwd = function() {
      return noSpecifiedFile
    }
    ruleFinder = getRuleFinder()
    assert.deepEqual(ruleFinder.getCurrentRules(), ['foo-rule'])
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
    assert.deepEqual(ruleFinder.getAllAvailableRules(), ['foo-rule', 'bar-rule', 'baz-rule'])
  })

  it('specifiedFile (relative path) is passed to the constructor', function() {
    var ruleFinder = getRuleFinder(specifiedFileRelative)
    assert.deepEqual(ruleFinder.getUnusedRules(), ['baz-rule', 'react/foo-rule', 'react/bar-rule', 'react/baz-rule'])
  })

  it('specifiedFile (relative path) - curent rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileRelative)
    assert.deepEqual(ruleFinder.getCurrentRules(), ['foo-rule', 'bar-rule'])
  })

  it('specifiedFile (relative path) - plugin rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileRelative)
    assert.deepEqual(ruleFinder.getPluginRules(), ['react/foo-rule', 'react/bar-rule', 'react/baz-rule'])
  })

  it('specifiedFile (relative path) - all available rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileRelative)
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      ['foo-rule', 'bar-rule', 'baz-rule', 'react/foo-rule', 'react/bar-rule', 'react/baz-rule']
    )
  })

  it('specifiedFile (absolut path) is passed to the constructor', function() {
    var ruleFinder = getRuleFinder(specifiedFileAbsolute)
    assert.deepEqual(ruleFinder.getUnusedRules(), ['baz-rule', 'react/foo-rule', 'react/bar-rule', 'react/baz-rule'])
  })

  it('specifiedFile (absolut path) - curent rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileAbsolute)
    assert.deepEqual(ruleFinder.getCurrentRules(), ['foo-rule', 'bar-rule'])
  })

  it('specifiedFile (absolut path) - plugin rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileAbsolute)
    assert.deepEqual(ruleFinder.getPluginRules(), ['react/foo-rule', 'react/bar-rule', 'react/baz-rule'])
  })

  it('specifiedFile (absolut path) - all available rules', function() {
    var ruleFinder = getRuleFinder(specifiedFileAbsolute)
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      ['foo-rule', 'bar-rule', 'baz-rule', 'react/foo-rule', 'react/bar-rule', 'react/baz-rule']
    )
  })
})
