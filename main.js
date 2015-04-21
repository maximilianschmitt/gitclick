'use strict';

const path = require('path');
const assign = require('object.assign');
const store = require('./lib/store');
const git = require('./lib/git');
const NoAccountSetError = require('./errors/no-account-set-error');
const AlreadyEncryptedError = require('./errors/already-encrypted-error');
const GithubProvider = require('gitclick-provider-github');
const BitbucketProvider = require('gitclick-provider-bitbucket');

const gitclick = function(storePath, password) {
  let s = store(storePath, password);

  return {
    isEncrypted: function() {
      const plaintextStore = store(storePath);

      return plaintextStore.read().then(notEncrypted).catch(encrypted);

      function encrypted() {
        return true;
      }

      function notEncrypted() {
        return false;
      }
    },
    encrypt: function() {
      const plaintextStore = store(storePath);

      return plaintextStore.read().then(writeEncrypted);

      function writeEncrypted(config) {
        return s.write(config);
      }
    },
    list: function() {
      return s.getAccounts();
    },
    remove: function(account) {
      return s.removeAccount(account);
    },
    add: function(account, config) {
      return s.addAccount(account, config);
    },
    use: function(account) {
      return s.setAccount(account);
    },
    defaultAccount: function() {
      return s.getAccount();
    },
    create: function(opts) {
      opts = opts || {};
      let repository;

      return getAccount()
        .then(getAccountConfig)
        .then(createRepository)
        .then(function(result) { repository = result; })
        .then(setRemote)
        .then(function() { return repository; });

      function getAccount() {
        return opts.account ? Promise.resolve(opts.account) : s.getAccount();
      }

      function getAccountConfig(account) {
        if (!account) {
          throw new NoAccountSetError();
        }

        return s.getAccountConfig(account);
      }

      function createRepository(accountConfig) {
        const Provider = accountConfig.provider === 'github' ? GithubProvider : BitbucketProvider;

        const provider = new Provider({
          auth: {
            type: 'basic',
            username: accountConfig.username,
            password: accountConfig.password
          },
          defaults: {
            wiki: typeof opts.wiki === 'boolean' ? opts.wiki : true,
            issues: typeof opts.issues === 'boolean' ? opts.issues : true,
            private: typeof opts.private === 'boolean' ? opts.private : false
          }
        });

        return provider.createRepository({
          name: opts.repository || path.basename(process.cwd()),
          wiki: typeof opts.wiki === 'boolean' ? opts.wiki : true,
          issues: typeof opts.issues === 'boolean' ? opts.issues : true,
          private: typeof opts.private === 'boolean' ? opts.private : false
        });
      }

      function setRemote() {
        if (opts.setRemote) {
          const remote = opts.setRemote === true ? 'origin' : opts.setRemote;
          return git(process.cwd()).setRemote(remote, repository.sshUrl);
        }
      }
    }
  };
};

module.exports = gitclick;