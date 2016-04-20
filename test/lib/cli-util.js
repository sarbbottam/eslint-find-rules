var assert = require('assert')
var proxyquire = require('proxyquire')
var sinon = require('sinon')

var moduleStub = {
  'window-size': {width: 80},
}

var loggerStub = {
  log: function noop() {},
}

describe('cli-util', function() {

  before(function() {
    sinon.stub(loggerStub, 'log')
  })

  after(function() {
    loggerStub.log.restore()
  })

  it('prints out single lines', function() {
    var cli = proxyquire('../../src/lib/cli-util', moduleStub)

    cli.push('A single line')
    cli.write(loggerStub)

    assert.ok(
      loggerStub.log.calledWith(
        sinon.match(/^A single line$/)
      )
    )
  })

  it('prints out multiple columns', function() {
    var cli = proxyquire('../../src/lib/cli-util', moduleStub)

    cli.push([
      'Everything in a single cell',
      'Everything in a single cell',
      'Everything in a single cell',
      'Everything in a single cell',
      'Everything in a single cell',
    ])
    cli.write(loggerStub)

    assert.ok(
      loggerStub.log.calledWith(
        sinon.match(/^(Everything in a single cell\s{13}Everything in a single cell\n){2}Everything in a single cell$/)
      )
    )
  })

  it('prints out with an exact amount of columns', function() {
    var cli = proxyquire('../../src/lib/cli-util', moduleStub)

    cli.push([
      'This in the first row',
      'This in the first row',
      'This in the first row',
      'This in the second row',
      'This in the second row',
    ], 3)
    cli.write(loggerStub)

    assert.ok(
      loggerStub.log.calledWith(
        sinon.match(
          /^(This in the first row(\s{5}){0,1}){3}\n(This in the second row(\s{4}){0,1}){2}$/
        )
      )
    )
  })

})
