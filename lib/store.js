'use strict';

const AccountNotFoundError = require('../errors/account-not-found-error');
const jsonStore = require('./json-store');

const store = function(configPath, password) {
  return {
    addAccount: function(account, accountConfig) {
      const store = this;

      return readConfig()
        .then(function(config) {
          config.accounts[account] = accountConfig;

          if (!config.account) {
            config.account = account;
          }

          return writeConfig(config);
        });
    },
    removeAccount: function(account) {
      return readConfig()
        .then(function(config) {
          delete config.accounts[account];
          
          if (config.account === account) {
            config.account = Object.keys(config.accounts)[0] || null;
          }

          return writeConfig(config);
        });
    },
    getAccounts: function() {
      return readConfig()
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
      return readConfig()
        .then(function(config) {
          return config.account;
        });
    },
    getAccountConfig: function(account) {
      return readConfig()
        .then(function(config) {
          if (!config.accounts[account]) {
            throw new AccountNotFoundError();
          }

          return config.accounts[account];
        });
    },
    setAccount: function(account) {
      return readConfig()
        .then(function(config) {
          if (!config.accounts[account]) {
            throw new AccountNotFoundError();
          }

          config.account = account;
          return writeConfig(config);
        });
    },
    read: function() {
      return readConfig();
    },
    write: function(config) {
      return writeConfig(config);
    }
  };

  function readConfig() {
    return jsonStore
      .ensureExists(configPath, { account: null, accounts: {} })
      .then(function() {
        return jsonStore.read(configPath, password);
      });
  }

  function writeConfig(config) {
    return jsonStore.write(configPath, config, password);
  }
};

module.exports = store;