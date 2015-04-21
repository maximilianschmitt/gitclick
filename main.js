'use strict';

const path = require('path');
const co = require('co');
const assign = require('object.assign');
const store = require('./lib/store');
const NoAccountSetError = require('./errors/no-account-set-error');
const AlreadyEncryptedError = require('./errors/already-encrypted-error');
const thenify = require('thenify');
const exec = thenify(require('child_process').exec);
let GithubProvider = require('gitclick-provider-github');
let BitbucketProvider = require('gitclick-provider-bitbucket');

const gitclick = function(storePath, password) {
  let s = store(storePath, password);

  return {
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
      return co(function*() {
        const repository = opts.repository || path.basename(process.cwd());
        const account = opts.account || (yield s.getAccount());

        if (!account) {
          throw new NoAccountSetError();
        }

        const accountConfig = yield s.getAccountConfig(account);
        const Provider = accountConfig.provider === 'github' ? GithubProvider : BitbucketProvider;

        const provider = new Provider({
          auth: {
            type: 'basic',
            username: accountConfig.username,
            password: accountConfig.password
          },
          defaults: {
            wiki: opts.wiki,
            issues: opts.issues,
            private: opts.private
          }
        });

        const repo = yield provider.createRepository({
          name: repository,
          wiki: opts.wiki,
          issues: opts.issues,
          private: opts.private
        });

        if (opts.setRemote) {
          yield exec(`git remote add ${opts.setRemote} ${repo.sshUrl}`, { cwd: process.cwd() });
        }

        return repo;
      });
    }
  };
};

module.exports = gitclick;