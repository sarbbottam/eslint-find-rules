const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const consoleLog = console.log; // eslint-disable-line no-console
const processExit = process.exit;

const getCurrentRules = sinon.stub().returns(['current', 'rules']);
const getPluginRules = sinon.stub().returns(['plugin', 'rules']);
const getAllAvailableRules = sinon.stub().returns(['all', 'available']);
const getUnusedRules = sinon.stub().returns(['unused', 'rules']);

let stub;

describe('bin', () => {
  beforeEach(() => {
    stub = {
      '../lib/rule-finder'() {
        return {
          getCurrentRules,
          getPluginRules,
          getAllAvailableRules,
          getUnusedRules
        };
      }
    };

    console.log = (...args) => { // eslint-disable-line no-console
      if (args[0].match(/(current|plugin|all-available|unused|rules found)/)) {
        return;
      }
      consoleLog(...args);
    };
    process.exit = function () {}; // noop
    process.argv = process.argv.slice(0, 2);
  });

  afterEach(() => {
    console.log = consoleLog; // eslint-disable-line no-console
    process.exit = processExit;
    // purge yargs cache
    delete require.cache[require.resolve('yargs')];
  });

  it('no option', () => {
    let callCount = 0;
    console.log = (...args) => { // eslint-disable-line no-console
      callCount += 1;
      if (args[0].match(
        /(no option provided, please provide a valid option|usage:|eslint-find-rules \[option] <file> \[flag])/)
      ) {
        return;
      }
      consoleLog(...args);
    };
    proxyquire('../../src/bin/find', stub);
    assert.equal(callCount, 3); // eslint-disable-line no-console
  });

  it('option -c|--current', () => {
    process.argv[2] = '-c';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getCurrentRules.called);
  });

  it('option -p|--plugin', () => {
    process.argv[2] = '-p';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getPluginRules.called);
  });

  it('option -a|--all-available', () => {
    process.argv[2] = '-a';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getAllAvailableRules.called);
    process.argv[2] = '--all-available';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getAllAvailableRules.called);
  });

  it('option -u|--unused', () => {
    process.exit = status => {
      assert.equal(status, 1);
    };
    process.argv[2] = '-u';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getUnusedRules.called);
  });

  it('options -u|--unused and no unused rules found', () => {
    getUnusedRules.returns([]);
    process.exit = status => {
      assert.equal(status, 0);
    };
    process.argv[2] = '-u';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getUnusedRules.called);
  });

  it('option -u|--unused along with -n|--no-error', () => {
    process.exit = status => {
      assert.equal(status, 0);
    };
    process.argv[2] = '-u';
    process.argv[3] = '-n';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getUnusedRules.called);
    process.argv[2] = '-u';
    process.argv[3] = '--no-error';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getUnusedRules.called);
  });

  it('logs verbosely', () => {
    process.argv[2] = '-c';
    process.argv[3] = '-v';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getCurrentRules.called);
  });

  it('logs core rules', () => {
    stub = {
      '../lib/rule-finder'(specifiedFile, noCore) {
        return {
          getCurrentRules() {
            assert(!noCore);
            return ['current', 'rules'];
          }
        };
      }
    };
    process.argv[2] = '-c';
    proxyquire('../../src/bin/find', stub);
  });

  it('does not log core rules', () => {
    stub = {
      '../lib/rule-finder'(specifiedFile, noCore) {
        return {
          getCurrentRules() {
            assert(noCore);
            return ['current', 'rules'];
          }
        };
      }
    };
    process.argv[2] = '-c';
    process.argv[3] = '--no-core';
    proxyquire('../../src/bin/find', stub);
  });
});
