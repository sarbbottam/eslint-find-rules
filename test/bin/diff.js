var assert = require('assert')
var proxyquire = require('proxyquire')
var sinon = require('sinon')

var consoleLog = console.log // eslint-disable-line no-console

var arrayDifference = sinon.stub().returns(['diff'])
var objectDifference = sinon.stub().returns(['diff'])

var stub = {
  '../lib/rule-finder': function() {
    return {
      getCurrentRules: function noop() {},
      getCurrentRulesDetailed: function noop() {},
    }
  },
  '../lib/array-diff': arrayDifference,
  '../lib/object-diff': objectDifference,
}

describe('diff', function() {

  beforeEach(function() {
    process.argv = process.argv.slice(0, 2)
  })

  afterEach(function() {
    console.log = consoleLog // eslint-disable-line no-console
    // purge yargs cache
    delete require.cache[require.resolve('yargs')]
  })

  it('log diff', function() {
    process.argv[2] = './foo'
    process.argv[3] = './bar'
    console.log = function() { // eslint-disable-line no-console
      if (arguments[0].match(/(diff)/)) {
        return
      }
      consoleLog.apply(null, arguments)
    }
    proxyquire('../../src/bin/diff', stub)
    assert.ok(arrayDifference.called)
  })

  it('verbose log diff', function() {
    process.argv[2] = './foo'
    process.argv[3] = './bar'
    process.argv[4] = '-v'
    console.log = function() { // eslint-disable-line no-console
      if (arguments[0].match(/(diff)/)) {
        return
      }
      consoleLog.apply(null, arguments)
    }
    proxyquire('../../src/bin/diff', stub)
    assert.ok(objectDifference.called)
  })
})
