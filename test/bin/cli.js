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

const providerPrompt = sinon.stub().resolves({ username: 'some-username', password: 'some-password' });

const gitclickMock = function(opts) {
  return {
    add: sinon.stub().resolves(),
    encrypt: sinon.stub().resolves(),
    decrypt: sinon.stub().resolves(),
    list: sinon.stub().resolves([]),
    defaultAccount: sinon.stub().resolves('some-account'),
    setPassword: sinon.stub().resolves(),
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
  '../lib/log': sinon.stub(),
  'inquirer': { prompt: promptMock },
  'gitclick-provider-github': { prompt: providerPrompt },
  'gitclick-provider-bitbucket': { prompt: providerPrompt }
});

describe('cli', function() {
  describe('encrypt', function() {
    it('encrypts gitclick if both passwords match', function() {
      const gcm = gitclickMock({ encrypted: false });
      const gcli = cli(gcm);

      promptMock.onPrompt = function(config, cb) {
        cb({ password: 'a-test-password', passwordConfirmation: 'a-test-password' });
      };

      return expect(gcli.encrypt())
        .to.eventually.be.fulfilled.then(checkForCall);

      function checkForCall() {
        expect(gcm.encrypt.called).to.equal(true);
      }
    });

    it('prompts for passwords until they match', function() {
      let pwPrompts = 0;
      const gcm = gitclickMock({ encrypted: false });
      const gcli = cli(gcm);

      promptMock.onPrompt = function(config, cb) {
        cb({ password: 'a-test-password-' + pwPrompts++, passwordConfirmation: 'a-test-password-1' });
      };

      return expect(gcli.encrypt())
        .to.eventually.be.fulfilled.then(checkForCalls);

      function checkForCalls() {
        expect(pwPrompts).to.equal(2);
        expect(gcm.encrypt.called).to.equal(true);
      }
    });

    it('does nothing if the store is already encrypted', function() {
      const gcm = gitclickMock({ encrypted: true });
      const gcli = cli(gcm);

      return expect(gcli.encrypt())
        .to.eventually.be.fulfilled.then(checkForCall);

      function checkForCall() {
        expect(gcm.encrypt.called).to.equal(false);
      }
    });
  });

  describe('decrypt', function() {
    it('prompts for password if the store is encrypted', function() {
      const gcli = cli(gitclickMock({ encrypted: true }));
      return testPasswordPrompt(gcli.decrypt());
    });

    it('decrypts encrypted stores', function() {
      const gcm = gitclickMock({ encrypted: true });
      const gcli = cli(gcm);

      promptMock.onPrompt = function(config, cb) {
        cb({ password: 'a-test-password' });
      };

      return expect(gcli.decrypt())
        .to.eventually.be.fulfilled.then(checkForCall);

      function checkForCall() {
        expect(gcm.decrypt.called).to.equal(true);
      }
    });
  });

  describe('create', function() {
    it('prompts for password if the store is encrypted', function() {
      const gcli = cli(gitclickMock({ encrypted: true }));
      return testPasswordPrompt(gcli.create());
    });

    it('creates repositories', function() {
      const gcm = gitclickMock({ encrypted: false });
      const gcli = cli(gcm);
      return expect(gcli.create())
        .to.eventually.be.fulfilled.then(checkForCall);

      function checkForCall() {
        expect(gcm.create.called).to.equal(true);
      }
    });
  });

  describe('remove', function() {
    it('prompts for password if the store is encrypted', function() {
      const gcli = cli(gitclickMock({ encrypted: true }));
      return testPasswordPrompt(gcli.remove('some-account'));
    });

    it('removes repositories', function() {
      const gcm = gitclickMock({ encrypted: false });
      const gcli = cli(gcm);
      return expect(gcli.remove())
        .to.eventually.be.fulfilled.then(checkForCall);

      function checkForCall() {
        expect(gcm.remove.called).to.equal(true);
      }
    });
  });

  describe('use', function() {
    it('prompts for password if the store is encrypted', function() {
      const gcli = cli(gitclickMock({ encrypted: true }));
      return testPasswordPrompt(gcli.use('some-account'));
    });

    it('sets repositories as default', function() {
      const gcm = gitclickMock({ encrypted: false });
      const gcli = cli(gcm);
      return expect(gcli.use())
        .to.eventually.be.fulfilled.then(checkForCall);

      function checkForCall() {
        expect(gcm.use.called).to.equal(true);
      }
    });
  });

  describe('defaultAccount', function() {
    it('prompts for password if the store is encrypted', function() {
      const gcli = cli(gitclickMock({ encrypted: true }));
      return testPasswordPrompt(gcli.defaultAccount());
    });

    it('shows the default account', function() {
      const gcm = gitclickMock({ encrypted: false });
      const gcli = cli(gcm);
      return expect(gcli.defaultAccount())
        .to.eventually.be.fulfilled.then(checkForCall);

      function checkForCall() {
        expect(gcm.defaultAccount.called).to.equal(true);
      }
    });
  });

  describe('list', function() {
    it('prompts for password if the store is encrypted', function() {
      const gcli = cli(gitclickMock({ encrypted: true }));
      return testPasswordPrompt(gcli.list());
    });

    it('lists accounts', function() {
      const gcm = gitclickMock({ encrypted: false });
      const gcli = cli(gcm);
      return expect(gcli.list())
        .to.eventually.be.fulfilled.then(checkForCall);

      function checkForCall() {
        expect(gcm.list.called).to.equal(true);
      }
    });
  });

  describe('add', function() {
    it('prompts for password if the store is encrypted', function() {
      const gcli = cli(gitclickMock({ encrypted: true }));
      return testPasswordPrompt(gcli.add(), onPrompt);

      function onPrompt(config, cb) {
        cb({ provider: 'github', account: 'some-account' });
      }
    });

    it('adds accounts', function() {
      const gcm = gitclickMock({ encrypted: false });
      const gcli = cli(gcm);

      promptMock.onPrompt = function(config, cb) {
        cb({ provider: 'github', account: 'some-account' });
      };

      return expect(gcli.add())
        .to.eventually.be.fulfilled.then(checkForCall);

      function checkForCall() {
        expect(gcm.add.called).to.equal(true);
      }
    });
  });

  function testPasswordPrompt(promise, onPrompt) {
    let promptedForPassword = false;

    promptMock.onPrompt = function(config, cb) {
      if (config.name === 'password') {
        promptedForPassword = true;
        cb({ password: 'a-test-password' });
        promptMock.onPrompt = onPrompt;
      }
    };

    return expect(promise)
      .to.eventually.be.fulfilled.then(checkPrompt);

    function checkPrompt() {
      expect(promptedForPassword).to.equal(true);
    }
  }
});