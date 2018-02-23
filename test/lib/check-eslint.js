const assert = require('assert');
const path = require('path');
const proxyquire = require('proxyquire');

const jsonPath = path.resolve(process.cwd(), 'package.json');
let stub;

describe('check-eslint', () => {
  beforeEach(() => {
    stub = {
      eslint: null,
      [jsonPath]: {
        peerDependencies: {
          eslint: '^1.2.3'
        }
      }
    };
  });

  it('reports absence of eslint', () => {
    const checkEslint = proxyquire('../../src/lib/check-eslint', stub);
    assert.equal(checkEslint.check(), false);
  });

  it('reports insufficient eslint installation', () => {
    stub.eslint = {CLIEngine: {version: '0.0.0'}};
    const checkEslint = proxyquire('../../src/lib/check-eslint', stub);
    assert.equal(checkEslint.check(), false);
  });

  it('reports satisfying eslint installation', () => {
    stub.eslint = {CLIEngine: {version: '1.3.4'}};
    const checkEslint = proxyquire('../../src/lib/check-eslint', stub);
    assert.ok(checkEslint.check(), true);
  });
});
