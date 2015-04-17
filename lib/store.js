'use strict';

const thenifyAll = require('thenify-all');
const jf = thenifyAll(require('jsonfile'), {});
const AccountNotFoundError = require('../errors/account-not-found-error');

const store = function(configPath) {
  return {
    addAccount: function(account, config) {
      const store = this;

      return readOrCreate(configPath)
        .then(function(gitclickConfig) {
          gitclickConfig.accounts[account] = config;

          if (!gitclickConfig.account) {
            gitclickConfig.account = account;
          }

          return jf.writeFile(configPath, gitclickConfig);
        });
    },
    removeAccount: function(account) {
      return readOrCreate(configPath)
        .then(function(config) {
          delete config.accounts[account];
          
          if (config.account === account) {
            config.account = Object.keys(config.accounts)[0] || null;
          }

          return jf.writeFile(configPath, config);
        });
    },
    getAccounts: function() {
      return readOrCreate(configPath)
        .then(function(config) {
          return config.accounts;
        })
        .then(function(accounts) {
          return Object.keys(accounts).map(function(account) {
            return { account: account, provider: accounts[account].provider };
          });
        });
    },
    getAccount: function(account) {
      return readOrCreate(configPath)
        .then(function(config) {
          return config.account;
        });
    },
    getAccountConfig: function(account) {
      return readOrCreate(configPath)
        .then(function(config) {
          if (!config.accounts[account]) {
            throw new AccountNotFoundError();
          }

          return config.accounts[account];
        });
    },
    setAccount: function(account) {
      return readOrCreate(configPath)
        .then(function(config) {
          if (!config.accounts[account]) {
            throw new AccountNotFoundError();
          }

          config.account = account;
          return jf.writeFile(configPath, config);
        });
    }
  };
};

function readOrCreate(filePath) {
  return jf
    .readFile(filePath)
    .catch(function(err) {
      if (err.code === 'ENOENT') {
        return jf.writeFile(filePath, { account: null, accounts: {} });
      }
    })
    .then(function() {
      return jf.readFile(filePath);
    });
}

module.exports = store;