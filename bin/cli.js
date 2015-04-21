'use strict';

const path = require('path');
const fs = require('fs');
const assign = require('object.assign');
const inquirer = require('inquirer');

const prompt = function(opts) {
  return new Promise(function(res) {
    inquirer.prompt(opts, res);
  });
};

const cli = function(gitclick) {
  const api = {
    encrypt: function() {
      return prompt([
        {
          type: 'password',
          name: 'key',
          message: 'Select a password'
        },
        {
          type: 'password',
          name: 'keyConfirmation',
          message: 'Confirm your password'
        }
      ])
      .then(function(answers) {
        if (answers.key !== answers.keyConfirmation) {
          console.log('Error: Your passwords don\'t match, try again!');
          api.encrypt();
          return;
        }

        return gitclick.encrypt(answers.key);
      })
      .then(function() {
        console.log('Your gitclick configuration is now encrypted.');
      })
      .catch(function(err) {
        if (err.name === 'AlreadyEncryptedError') {
          console.log('Error: Your gitclick configuration is already encrypted.');
          console.log('You can `gitclick decrypt` to permanently decrypt your configuration and then encrypt again.');
          return;
        }

        console.log('Error: An unkown error occurred while trying to encrypt your configuration file.');
      });
    },
    create: function(opts) {
      return gitclick
        .create(opts)
        .then(function(repository) {
          console.log(`Repository '${repository.name}' created.`);

          if (opts.setRemote) {
            console.log(`Remote '${opts.setRemote}' set to: ${repository.sshUrl}`);
          }

          console.log('SSH URL: ' + repository.sshUrl);
          console.log('Clone URL: ' + repository.cloneUrl);
        })
        .catch(function(err) {
          if (err.name === 'NoAccountSetError') {
            console.log('Error: No account set. Use `gitclick add` to add an account.');
            return;
          }

          if (err.name === 'ProviderError' && err.message === 'Validation Failed') {
            console.log('Error: Repository could not be created. Maybe it already exists?');
            return;
          }

          e(err);
        });
    },
    defaultAccount: function() {
      return gitclick
        .defaultAccount()
        .then(function(account) {
          console.log(account);
        });
    },
    add: function() {
      let account, provider;

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
      ])
      .then(function(answers) {
        account = answers.account;
        provider = answers.provider;
        
        const Provider = require('gitclick-provider-' + provider);
        return Provider.prompt();
      })
      .then(function(answers) {
        const config = assign({ provider: provider }, answers);
        return gitclick.add(account, config);
      })
      .then(function() {
        console.log(`Account '${account}' added.`);
      })
      .catch(function(err) {
        console.log(err.stack);
      });
    },
    list: function() {
      return Promise
        .all([
          gitclick.list(),
          gitclick.defaultAccount()
        ])
        .then(function(result) {
          const accounts = result[0];
          const defaultAccount = result[1];

          accounts.forEach(function(account) {
            console.log(`${account.account === defaultAccount ? '* ' : ''}${account.account} (${account.provider})`);
          });
        });
    },
    remove: function(account) {
      return gitclick
        .remove(account)
        .then(function() {
          console.log(`Account '${account}' was removed.`);
        });
    },
    use: function(account) {
      return gitclick
        .use(account)
        .then(function() {
          console.log(`Now using ${account} by default when creating new repositories.`);
        })
        .catch(function(err) {
          if (err.name === 'AccountNotFoundError') {
            console.log(`Error: Account '${account}' was not found.`);
            return;
          }

          e(err);
        });
    },
    help: function() {
      console.log(require('../package.json').version);
    },
    version: function() {
      return fs.createReadStream(path.join(__dirname, 'usage.txt')).pipe(process.stdout);
    }
  };

  return api;
};

function e(err) {
  setTimeout(function() {
    throw err;
  });
}

module.exports = cli;