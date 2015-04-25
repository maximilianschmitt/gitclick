/* global describe, it */
'use strict';

const ProviderMock = function(opts) {
  ProviderMock.opts = opts;
  ProviderMock.repository = null;

  this.createRepository = function(opts) {
    ProviderMock.repository = opts;

    return Promise.resolve({
      name: opts.name,
      sshUrl: `https://provider/${opts.name}`,
      cloneUrl: `https://provider/${opts.name}`
    });
  };
};

const gitMock = function(cwd) {
  gitMock.cwd = cwd;

  return {
    setRemote: function(name, url) {
      gitMock.remoteName = name;
      gitMock.remoteUrl = url;

      return Promise.resolve();
    }
  };
};

gitMock.reset = function() {
  gitMock.cwd = null;
  gitMock.remoteName = null;
  gitMock.remoteUrl = null;
};

const AccountNotFoundError = require('../errors/account-not-found-error');
const NoAccountSetError = require('../errors/no-account-set-error');
const c = require('./helpers/test-configs');
const proxyquire = require('proxyquire');
const chai = require('chai');
const expect = chai.expect;
const fs = require('thenify-all')(require('fs'));
const gitclick = proxyquire('../main', {
  'gitclick-provider-github': ProviderMock,
  'gitclick-provider-bitbucket': ProviderMock,
  './lib/git': gitMock
});

chai.use(require('chai-as-promised'));

describe('gitclick', function() {
  it('exposes a factory function', function() {
    expect(gitclick).to.be.a('function');
  });

  describe('decrypt', function() {
    it('decrypts the contents of the store', function() {
      const gc = gitclick(c.encryptedConfigPath, c.password);

      return expect(gc.decrypt().then(readFile).then(JSON.parse))
        .to.eventually.deep.equal({ account: null, accounts: {} });

      function readFile() {
        return fs.readFile(c.defaultConfigPath);
      }
    });
  });

  describe('encrypt', function() {
    it('encrypts the contents of the store', function() {
      const gc = gitclick(c.defaultConfigPath);

      return expect(gc.encrypt(c.password).then(readFile).then(toString))
        .to.eventually.equal('w/gYRs08GryHtq/bc/8/w3qzDTyUDwGAAKfAvobKzQs=');

      function readFile() {
        return fs.readFile(c.defaultConfigPath);
      }

      function toString(buff) {
        return buff.toString();
      }
    });

    it('does not encrypt already encrypted stores', function() {
      const gc = gitclick(c.encryptedConfigPath);

      return expect(gc.encrypt(c.password)).to.eventually.be.rejected.then(verifyContent);

      function verifyContent() {
        return expect(readFile().then(toString))
          .to.eventually.equal('w/gYRs08GryHtq/bc/8/w3qzDTyUDwGAAKfAvobKzQs=');
      }

      function readFile() {
        return fs.readFile(c.encryptedConfigPath);
      }

      function toString(buff) {
        return buff.toString();
      }
    });
  });

  describe('isEncrypted', function() {
    it('resolves to true if the store is encrypted', function() {
      const gc = gitclick(c.encryptedConfigPath, c.password);

      return expect(gc.isEncrypted())
        .to.eventually.equal(true);
    });

    it('resolves to false if the store is not encrypted', function() {
      const gc = gitclick(c.defaultConfigPath);

      return expect(gc.isEncrypted())
        .to.eventually.equal(false);
    });
  });

  describe('create', function() {
    it('throws AccountNotFoundError if provided account does not exist in store', function() {
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create({ account: 'non-existent' }))
        .to.eventually.be.rejectedWith(AccountNotFoundError);
    });

    it('throws NoAccountSetError if no account is set in store', function() {
      const gc = gitclick(c.defaultConfigPath);

      return expect(gc.create({}))
        .to.eventually.be.rejectedWith(NoAccountSetError);
    });

    it('creates repositories', function() {
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create({ repository: 'a-repository', account: 'private' }))
        .to.eventually.deep.equal({
          name: 'a-repository',
          sshUrl: 'https://provider/a-repository',
          cloneUrl: 'https://provider/a-repository'
        });
    });

    it('creates repositories with issues by default', function() {
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create())
        .to.eventually.be.fulfilled.then(checkIssues);

      function checkIssues() {
        expect(ProviderMock.repository.issues).to.equal(true);
      }
    });

    it('creates repositories with a wiki by default', function() {
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create())
        .to.eventually.be.fulfilled.then(checkWiki);

      function checkWiki() {
        expect(ProviderMock.repository.wiki).to.equal(true);
      }
    });

    it('creates public repositories by default', function() {
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create())
        .to.eventually.be.fulfilled.then(checkVisibility);

      function checkVisibility() {
        expect(ProviderMock.repository.private).to.equal(false);
      }
    });

    it('creates repositories without issues if specified', function() {
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create({ issues: false }))
        .to.eventually.be.fulfilled.then(checkIssues);

      function checkIssues() {
        expect(ProviderMock.repository.issues).to.equal(false);
      }
    });

    it('creates repositories without a wiki if specified', function() {
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create({ wiki: false }))
        .to.eventually.be.fulfilled.then(checkWiki);

      function checkWiki() {
        expect(ProviderMock.repository.wiki).to.equal(false);
      }
    });

    it('creates private repositories if specified', function() {
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create({ private: true }))
        .to.eventually.be.fulfilled.then(checkVisibility);

      function checkVisibility() {
        expect(ProviderMock.repository.private).to.equal(true);
      }
    });

    it('configures the provider with the necessary auth information', function() {
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create())
        .to.eventually.be.fulfilled.then(checkAuthConfig);

      function checkAuthConfig() {
        expect(ProviderMock.opts.auth).to.deep.equal({
          type: 'basic',
          username: 'private-username',
          password: 'private-password'
        });
      }
    });

    it('uses default account if none provided', function() {
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create({ repository: 'a-repository' }))
        .to.eventually.deep.equal({
          name: 'a-repository',
          sshUrl: 'https://provider/a-repository',
          cloneUrl: 'https://provider/a-repository'
        });
    });

    it('uses name of current folder if none provided', function() {
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create())
        .to.eventually.deep.equal({
          name: 'gitclick',
          sshUrl: 'https://provider/gitclick',
          cloneUrl: 'https://provider/gitclick'
        });
    });

    it('sets remote if provided', function() {
      gitMock.reset();
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create({ repository: 'a-repository', setRemote: 'develop' }))
        .to.eventually.be.fulfilled.then(checkRemoteSet);

      function checkRemoteSet() {
        expect(gitMock.cwd).to.equal(process.cwd());
        expect(gitMock.remoteName).to.equal('develop');
        expect(gitMock.remoteUrl).to.equal('https://provider/a-repository');
      }
    });

    it('sets remote as origin if not specified', function() {
      gitMock.reset();
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create({ repository: 'a-repository', setRemote: true }))
        .to.eventually.be.fulfilled.then(checkRemoteSet);

      function checkRemoteSet() {
        expect(gitMock.cwd).to.equal(process.cwd());
        expect(gitMock.remoteName).to.equal('origin');
        expect(gitMock.remoteUrl).to.equal('https://provider/a-repository');
      }
    });

    it('does not set origin if not provided', function() {
      gitMock.reset();
      const gc = gitclick(c.existingConfigPath);

      return expect(gc.create({ repository: 'a-repository' }))
        .to.eventually.be.fulfilled.then(checkRemoteSet);

      function checkRemoteSet() {
        expect(gitMock.cwd).to.not.be.ok;
        expect(gitMock.remoteName).to.not.be.ok;
        expect(gitMock.remoteUrl).to.not.be.ok;
      }
    });
  });
});