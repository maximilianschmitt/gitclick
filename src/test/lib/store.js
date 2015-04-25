/* global describe, it */

const store = require('../../lib/store');
const fs = require('thenify-all')(require('fs'));
const c = require('../helpers/test-configs');
const chai = require('chai');
const AccountNotFoundError = require('../../errors/account-not-found-error');
const expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('store', function() {
  const defaultStore = store(c.defaultConfigPath);
  const existingStore = store(c.existingConfigPath);
  const oneAccountStore = store(c.oneAccountConfigPath);

  const accountName = 'account-name';
  const accountConfig = {
    provider: 'github',
    username: 'user',
    password: 'pass'
  };

  describe('addAccount', function() {
    it('adds accounts', function() {
      return expect(defaultStore.addAccount(accountName, accountConfig).then(readFile).then(JSON.parse))
        .to.eventually.have.deep.property('accounts.' + accountName).deep.equal(accountConfig);

      function readFile() {
        return fs.readFile(c.defaultConfigPath);
      }
    });

    it('sets first account as default account', function() {
      return expect(defaultStore.addAccount(accountName, accountConfig).then(readFile).then(JSON.parse))
        .to.eventually.have.property('account', accountName);

      function readFile() {
        return fs.readFile(c.defaultConfigPath);
      }
    });

    it('does not alter default account if already set', function() {
      return expect(existingStore.addAccount(accountName, accountConfig).then(readFile).then(JSON.parse))
        .to.eventually.have.property('account', 'private');

      function readFile() {
        return fs.readFile(c.existingConfigPath);
      }
    });
  });

  describe('removeAccount', function() {
    it('removes accounts', function() {
      return expect(existingStore.removeAccount('private').then(readFile).then(JSON.parse))
        .to.eventually.not.have.deep.property('accounts.private');

      function readFile() {
        return fs.readFile(c.existingConfigPath);
      }
    });

    it('unsets default account if removed account was default account', function() {
      return expect(existingStore.removeAccount('private').then(readFile).then(JSON.parse))
        .to.eventually.have.property('account').not.equal('private');

      function readFile() {
        return fs.readFile(c.existingConfigPath);
      }
    });

    it('sets default account to another account if removed account was default account', function() {
      return expect(existingStore.removeAccount('private').then(readFile).then(JSON.parse))
        .to.eventually.have.property('account').equal('work');

      function readFile() {
        return fs.readFile(c.existingConfigPath);
      }
    });

    it('sets default account to null if removed account was last account', function() {
      return expect(oneAccountStore.removeAccount('private').then(readFile).then(JSON.parse))
        .to.eventually.have.property('account').equal(null);

      function readFile() {
        return fs.readFile(c.oneAccountConfigPath);
      }
    });
  });

  describe('getAccounts', function() {
    it('returns all accounts', function() {
      return expect(existingStore.getAccounts())
        .to.eventually.have.length(2);
    });
  });

  describe('getAccount', function() {
    it('returns default account', function() {
      return expect(existingStore.getAccount())
        .to.eventually.equal('private');
    });
  });

  describe('getAccountConfig', function() {
    it('returns account config for provided `account`', function() {
      return expect(existingStore.getAccountConfig('private'))
        .to.eventually.deep.equal({
          provider: 'github',
          username: 'private-username',
          password: 'private-password'
        });
    });

    it('throws AccountNotFoundError if provided `account` does not exist', function() {
      return expect(existingStore.getAccountConfig('non-existent'))
        .to.eventually.be.rejectedWith(AccountNotFoundError);
    });
  });

  describe('setAccount', function() {
    it('sets provided `account` as default account', function() {
      return expect(existingStore.setAccount('work').then(readFile).then(JSON.parse))
        .to.eventually.have.property('account').equal('work');

      function readFile() {
        return fs.readFile(c.existingConfigPath);
      }
    });

    it('throws AccountNotFoundError if provided `account` does not exist', function() {
      return expect(existingStore.setAccount('non-existent'))
        .to.eventually.be.rejectedWith(AccountNotFoundError);
    });
  });

  describe('read', function() {
    it('returns entire store configuration', function() {
      return expect(oneAccountStore.read())
        .to.eventually.deep.equal({
          account: 'private',
          accounts: {
            private: {
              provider: 'github',
              username: 'private-username',
              password: 'private-password'
            }
          }
        });
    });
  });

  describe('write', function() {
    it('replaces entire store configuration', function() {
      return expect(oneAccountStore.write({ account: null, accounts: {} }).then(readFile).then(JSON.parse))
        .to.eventually.deep.equal({ account: null, accounts: {} });

      function readFile() {
        return fs.readFile(c.oneAccountConfigPath);
      }
    });
  });
});