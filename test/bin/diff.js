var assert = require('assert')
var proxyquire = require('proxyquire')
var sinon = require('sinon')

var consoleLog = console.log // eslint-disable-line no-console

var difference = sinon.stub().returns(['diff'])

var stub = {
  '../lib/rule-finder': function() {
    return {
      getCurrentRules: function noop() {},
    }
  },
  '../lib/array-diff': difference,
}

describe('diff', function() {

  beforeEach(function() {
    process.argv = process.argv.slice(0, 2)
  })

  afterEach(function() {
    console.log = consoleLog // eslint-disable-line no-console
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
    assert.ok(difference.called)
  })
})
