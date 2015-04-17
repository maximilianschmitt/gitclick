'use strict';

const path = require('path');
const co = require('co');
const store = require('./lib/store')('./.gitclick');
const NoAccountSetError = require('./errors/no-account-set-error');
const assign = require('object.assign');

const gitclick = {
  list: function() {
    return store.getAccounts();
  },
  remove: function(account) {
    return store.removeAccount(account);
  },
  add: function(account, config) {
    return store.addAccount(account, config);
  },
  use: function(account) {
    return store.setAccount(account);
  },
  create: function(opts) {
    return co(function*() {
      const repository = opts.repository || path.basename(process.cwd());
      const account = opts.account || (yield store.getAccount());

      if (!account) {
        throw new NoAccountSetError();
      }

      const accountConfig = yield store.getAccountConfig(account);
      const Provider = require('gitclick-provider-' + accountConfig.provider);

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

      return provider.createRepository({
        name: opts.repository,
        wiki: opts.wiki,
        issues: opts.issues,
        private: opts.private
      });
    });
  }
};

module.exports = gitclick;