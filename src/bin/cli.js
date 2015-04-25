'use strict';

const path = require('path');
const fs = require('fs');
const assign = require('object.assign');
const inquirer = require('inquirer');
const log = require('../lib/log');

const prompt = function(opts) {
  return new Promise(function(res) {
    inquirer.prompt(opts, res);
  });
};

const cli = function(gitclick) {
  const api = {
    decrypt: function() {
      return ensureAccess().then(decrypt).then(showUser);

      function decrypt() {
        return gitclick.decrypt();
      }

      function showUser() {
        log('Your gitclick configuration is no longer encrypted.');
      }
    },
    encrypt: function() {
      return gitclick.isEncrypted().then(cancelOrStartEncryption);

      function cancelOrStartEncryption(isEncrypted) {
        if (isEncrypted) {
          log('Your gitclick configuration is already encrypted.');
          return;
        }

        return promptForPasswords().then(encryptOrAskAgain).then(showUser);
      }

      function promptForPasswords() {
        return prompt([
          {
            type: 'password',
            name: 'password',
            message: 'Select a password'
          },
          {
            type: 'password',
            name: 'passwordConfirmation',
            message: 'Confirm your password'
          }
        ]);
      }

      function encryptOrAskAgain(answers) {
        if (answers.password !== answers.passwordConfirmation) {
          log('Error: Your passwords don\'t match, try again!');
          api.encrypt();
          return;
        }

        return gitclick.encrypt(answers.password);
      }

      function showUser() {
        log('Your gitclick configuration is now encrypted.');
      }
    },
    create: function(opts) {
      opts = opts || {};

      return ensureAccess().then(createRepository).then(showUser).catch(handleError);

      function createRepository() {
        return gitclick.create(opts);
      }

      function showUser(repository) {
        log(`Repository '${repository.name}' created.`);

        if (opts.setRemote) {
          log(`Remote '${opts.setRemote}' set to: ${repository.sshUrl}`);
        }

        log('SSH URL: ' + repository.sshUrl);
        log('Clone URL: ' + repository.cloneUrl);
      }

      function handleError(err) {
        if (err.name === 'NoAccountSetError') {
          log('Error: No account set. Use `gitclick add` to add an account.');
          return;
        }

        if (err.name === 'ProviderError' && err.message === 'Validation Failed') {
          log('Error: Repository could not be created. Maybe it already exists?');
          return;
        }

        e(err);
      }
    },
    defaultAccount: function() {
      return ensureAccess().then(gitclick.defaultAccount).then(log);
    },
    add: function() {
      let account, provider;

      return ensureAccess()
        .then(promptForNameAndProvider)
        .then(setAccountAndProvider)
        .then(promptForAuthInfo)
        .then(addAccount)
        .then(showUser)
        .catch(handleError);

      function promptForNameAndProvider() {
        return prompt([
          {
            type: 'input',
            name: 'account',
            message: 'Choose a name',
            validate: function(value) {
              if (value.indexOf(' ') !== -1) {
                return 'Please don\'t use spaces in your account\'s name';
              }

              return true;
            }
          },
          {
            type: 'list',
            name: 'provider',
            message: 'Where is your account hosted?',
            default: 'github',
            choices: [
              { value: 'github', name: 'GitHub' },
              { value: 'bitbucket', name: 'Bitbucket' }
            ]
          }
        ]);
      }

      function setAccountAndProvider(accountAndProvider) {
        account = accountAndProvider.account;
        provider = accountAndProvider.provider;
      }

      function promptForAuthInfo() {
        const Provider = require('gitclick-provider-' + provider);
        return Provider.prompt();
      }
      
      function addAccount(authInfo) {
        const config = assign({ provider: provider }, authInfo);
        return gitclick.add(account, config);
      }

      function showUser() {
        log(`Account '${account}' added.`);
      }

      function handleError(err) {
        log(err.stack);
      }
    },
    list: function() {
      return ensureAccess().then(getListAndDefaultAccount).then(showUser);

      function getListAndDefaultAccount() {
        return Promise.all([gitclick.list(), gitclick.defaultAccount()]);
      }

      function showUser(results) {
        const accounts = results[0];
        const defaultAccount = results[1];

        accounts.forEach(function(account) {
          log(`${account.account === defaultAccount ? '* ' : ''}${account.account} (${account.provider})`);
        });
      }
    },
    remove: function(account) {
      return ensureAccess().then(removeAccount).then(showUser);

      function removeAccount() {
        return gitclick.remove(account);
      }

      function showUser() {
        log(`Account '${account}' was removed.`);
      }
    },
    use: function(account) {
      return ensureAccess().then(useAccount).then(showUser).catch(handleError);

      function useAccount() {
        return gitclick.use(account);
      }

      function showUser() {
        log(`Now using ${account} by default when creating new repositories.`);
      }

      function handleError(err) {
        if (err.name === 'AccountNotFoundError') {
          log(`Error: Account '${account}' was not found.`);
          return;
        }

        e(err);
      }
    },
    help: function() {
      return fs.createReadStream(path.join(__dirname, 'usage.txt')).pipe(process.stdout);
    },
    version: function() {
      log(require('../package.json').version);
    }
  };

  return api;

  function ensureAccess() {
    return gitclick.isEncrypted().then(promptIfNecessary);
    
    function promptIfNecessary(isEncrypted) {
      if (isEncrypted) {
        return prompt({
          type: 'password',
          name: 'password',
          message: 'Please enter your gitclick password'
        }).then(setPassword);
      }
    }

    function setPassword(answer) {
      gitclick.setPassword(answer.password);
    }
  }
};

function e(err) {
  setTimeout(function() {
    throw err;
  });
}

module.exports = cli;