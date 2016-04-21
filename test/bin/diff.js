var assert = require('assert')
var proxyquire = require('proxyquire')
var sinon = require('sinon')

var consoleLog = console.log // eslint-disable-line no-console

var stub = {
  '../lib/rule-finder': function() {
    return {
      getCurrentRules: function noop() {},
      getCurrentRulesDetailed: function noop() {},
    }
  },
  '../lib/array-diff': sinon.stub().returns(['diff']),
  '../lib/object-diff': sinon.stub().returns([{'test-rule': {config1: 'foo-config', config2: 'bar-config'}}]),
}

describe('diff', function() {

  beforeEach(function() {
    process.argv = process.argv.slice(0, 2)
    sinon.stub(console, 'log', function() {
      // print out everything but the test target's output
      if (!arguments[0].match(/diff/)) {
        consoleLog.apply(null, arguments)
      }
    })
  })

  afterEach(function() {
    console.log.restore() // eslint-disable-line no-console
    // purge yargs cache
    delete require.cache[require.resolve('yargs')]
  })

  it('logs diff', function() {
    process.argv[2] = './foo'
    process.argv[3] = './bar'
    proxyquire('../../src/bin/diff', stub)
    assert.ok(
      console.log.calledWith( // eslint-disable-line no-console
        sinon.match(
          /diff rules[^]*in foo but not in bar:[^]*diff[^]*in bar but not in foo:[^]*diff/
        )
      )
    )
  })

  it('logs diff verbosely', function() {
    process.argv[2] = '--verbose'
    process.argv[3] = './foo'
    process.argv[4] = './bar'
    proxyquire('../../src/bin/diff', stub)
    assert.ok(
      console.log.calledWith( // eslint-disable-line no-console
        sinon.match(
          /diff rules[^]*foo[^]*bar[^]*test-rule[^]*foo-config[^]*bar-config/
        )
      )
    )
  })
})
