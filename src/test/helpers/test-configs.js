'use strict';

const path = require('path');
const fs = require('thenify-all')(require('fs'), {});
const del = require('thenify')(require('del'));

const nonExistingConfigPath = path.join(__dirname, '..', 'fixtures', 'non-existing-config');
const defaultConfigPath = path.join(__dirname, '..', 'fixtures', 'default-config');
const encryptedConfigPath = path.join(__dirname, '..', 'fixtures', 'encrypted-config');
const existingConfigPath = path.join(__dirname, '..', 'fixtures', 'existing-config');
const oneAccountConfigPath = path.join(__dirname, '..', 'fixtures', 'one-account-config');

const existingConfig = `{
  "account": "private",
  "accounts": {
    "private": {
      "provider": "github",
      "username": "private-username",
      "password": "private-password"
    },
    "work": {
      "provider": "github",
      "username": "work-username",
      "password": "work-password"
    }
  }
}`;

const oneAccountConfig = `{
  "account": "private",
  "accounts": {
    "private": {
      "provider": "github",
      "username": "private-username",
      "password": "private-password"
    }
  }
}`;

const testConfigs = {
  password: 'a-test-password',
  nonExistingConfigPath: nonExistingConfigPath,
  defaultConfigPath: defaultConfigPath,
  encryptedConfigPath: encryptedConfigPath,
  existingConfigPath: existingConfigPath,
  oneAccountConfigPath: oneAccountConfigPath,

  resetAllConfigs: function() {
    return Promise.all([
      testConfigs.resetDefaultConfig(),
      testConfigs.resetEncryptedConfig(),
      testConfigs.resetNonExistingConfig(),
      testConfigs.resetExistingConfig(),
      testConfigs.resetOneAccountConfig()
    ]);
  },

  resetDefaultConfig: function() {
    return fs.writeFile(defaultConfigPath, '{ "account": null, "accounts": {} }');
  },

  resetEncryptedConfig: function() {
    return fs.writeFile(encryptedConfigPath, 'w/gYRs08GryHtq/bc/8/w3qzDTyUDwGAAKfAvobKzQs=');
  },

  resetExistingConfig: function() {
    return fs.writeFile(existingConfigPath, existingConfig);
  },

  resetOneAccountConfig: function() {
    return fs.writeFile(oneAccountConfigPath, oneAccountConfig);
  },

  resetNonExistingConfig: function() {
    return del(nonExistingConfigPath);
  },
};

module.exports = testConfigs;