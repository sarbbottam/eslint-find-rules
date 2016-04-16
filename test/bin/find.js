var assert = require('assert')
var proxyquire = require('proxyquire')
var sinon = require('sinon')

var consoleLog = console.log // eslint-disable-line no-console
var processExit = process.exit

var getCurrentRules = sinon.stub().returns(['current'])
var getPluginRules = sinon.stub().returns(['plugin'])
var getAllAvailableRules = sinon.stub().returns(['all-available'])
var getUnusedRules = sinon.stub().returns(['unused'])

var stub = {
  '../lib/rule-finder': function() {
    return {
      getCurrentRules: getCurrentRules,
      getPluginRules: getPluginRules,
      getAllAvailableRules: getAllAvailableRules,
      getUnusedRules: getUnusedRules,
    }
  },
}

describe('bin', function() {
  beforeEach(function() {
    console.log = function() { // eslint-disable-line no-console
      if (arguments[0].match(/(current|plugin|all\-available|unused)/)) {
        return
      }
      consoleLog.apply(null, arguments)
    }
    process.exit = function noop() {}
    process.argv = process.argv.slice(0, 2)
  })

  afterEach(function() {
    console.log = consoleLog // eslint-disable-line no-console
    process.exit = processExit
    // purge yargs cache
    delete require.cache[require.resolve('yargs')]
  })

  it('option -c|--current', function() {
    process.argv[2] = '-c'
    proxyquire('../../src/bin/find', stub)
    assert.ok(getCurrentRules.called)
  })

  it('option -p|--plugin', function() {
    process.argv[2] = '-p'
    proxyquire('../../src/bin/find', stub)
    assert.ok(getPluginRules.called)
  })

  it('option -a|--all-available', function() {
    process.argv[2] = '-a'
    proxyquire('../../src/bin/find', stub)
    assert.ok(getAllAvailableRules.called)
  })

  it('option -u|--unused', function() {
    process.exit = function(status) {
      assert.equal(status, 1)
    }
    process.argv[2] = '-u'
    proxyquire('../../src/bin/find', stub)
    assert.ok(getUnusedRules.called)
  })

  it('options -u|--unused and no unused rules found', function() {
    getUnusedRules.returns([])
    process.exit = function(status) {
      assert.equal(status, 0)
    }
    process.argv[2] = '-u'
    proxyquire('../../src/bin/find', stub)
    assert.ok(getUnusedRules.called)
  })

  it('option -u|--unused along with -n|no-error', function() {
    process.exit = function(status) {
      assert.equal(status, 0)
    }
    process.argv[2] = '-u'
    process.argv[3] = '-n'
    proxyquire('../../src/bin/find', stub)
    assert.ok(getUnusedRules.called)
  })

  it('verbose log', function() {
    console.log = function() { // eslint-disable-line no-console
      if (arguments[0].match(/(current)/) && arguments[0].match(/(rules found)/)) {
        return
      }
      consoleLog.apply(null, arguments)
    }
    process.argv[2] = '-c'
    process.argv[3] = '--verbose'
    proxyquire('../../src/bin/find', stub)
    assert.ok(getCurrentRules.called)
  })
})
