/* global describe, it, beforeEach, afterEach */
'use strict';

require('sinon-as-promised');

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

chai.use(require('chai-as-promised'));

const promptMock = function(config, cb) {
  if (promptMock.onPrompt) {
    promptMock.onPrompt(config, cb);
    return;
  }

  cb({});
};

const gitclickMock = function(opts) {
  return {
    setPassword: sinon.stub(),
    remove: sinon.stub().resolves(),
    use: sinon.stub().resolves(),
    create: sinon.stub().resolves({
      name: 'gitclick',
      sshUrl: 'https://provider/gitclick',
      cloneUrl: 'https://provider/gitclick'
    }),
    isEncrypted: sinon.stub().resolves(opts.encrypted)
  };
};

const cli = proxyquire('../../bin/cli', {
  '../lib/log': function() {},
  'inquirer': { prompt: promptMock }
});

describe('cli', function() {
  describe('create', function() {
    it('prompts for password if the store is encrypted', function() {
      const gcli = cli(gitclickMock({ encrypted: true }));
      return testPasswordPrompt(gcli.create());
    });
  });

  describe('remove', function() {
    it('prompts for password if the store is encrypted', function() {
      const gcli = cli(gitclickMock({ encrypted: true }));
      return testPasswordPrompt(gcli.remove('some-account'));
    });
  });

  describe('use', function() {
    it('prompts for password if the store is encrypted', function() {
      const gcli = cli(gitclickMock({ encrypted: true }));
      return testPasswordPrompt(gcli.use('some-account'));
    });
  });

  function testPasswordPrompt(promise) {
    let promptedForPassword = false;

    promptMock.onPrompt = function(config, cb) {
      if (config.name === 'password') {
        promptedForPassword = true;
        cb({ password: 'a-test-password' });
      }
    };

    return expect(promise)
      .to.eventually.be.fulfilled.then(checkPrompt);

    function checkPrompt() {
      expect(promptedForPassword).to.equal(true);
    }
  }
});