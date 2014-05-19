'use strict';

var colors          = require('colors');
var Promise         = require('bluebird');
var cli             = require('../../util');
var ValidationError = require('gitclick-util').errors.ValidationError;
var validator       = require('./validator');

var validate;

module.exports = function(gitclick) {
    validate = validator(gitclick);

    return gitclick.load()
        .then(function() {
            return configure(gitclick);
        })
        .then(function(config) {
            return gitclick.boxes.insert(config.name, {
                name: config.provider,
                config: {
                    auth: {
                        type: 'basic',
                        username: config.username,
                        password: config.password
                    },
                    defaults: {
                        issues: config.issues,
                        private: config.private,
                        wiki: config.wiki
                    }
                }
            });
        })
        .then(function() {
            cli.printSuccess('Your new box was successfully added.');
        });
};

function configure(gitclick) {

    var config = {};

    return chooseName()
        .then(function(name) {
            config.name = name;
            return chooseProvider();
        })
        .then(function(provider) {
            config.provider = provider;
            return chooseCredentials(provider);
        })
        .then(function(result) {
            config.username = result.username;
            config.password = result.password;

            return chooseDefaultIssues();
        })
        .then(function(issues) {
            config.issues = issues;

            return chooseDefaultWiki();
        })
        .then(function(wiki) {
            config.wiki = wiki;

            return chooseDefaultPrivate();
        })
        .then(function(value) {
            config.private = value;

            return config;
        });
}

function chooseName() {
    return cli.prompt('Choose a name:')
        .then(validate.name)
        .catch(ValidationError, function(err) {
            cli.printError(err.message);
            return chooseName();
        });
}

function chooseProvider() {
    return cli.prompt('Choose a provider (github or bitbucket):')
        .then(validate.provider)
        .catch(ValidationError, function(err) {
            cli.printError(err.message);
            return chooseProvider();
        });
}

function chooseCredentials(provider) {
    var username, password;
    return cli.prompt('Enter your ' + provider + ' username:')
        .then(function(value) {
            username = value;
            return cli.password('Enter your ' + provider + ' password:');
        })
        .then(function(value) {
            password = value;

            return Promise.resolve({ username: username, password: password });
        });
}

function chooseDefaultIssues() {
    return cli.boolean('Setup repositories to have issues by default?');
}

function chooseDefaultWiki() {
    return cli.boolean('Setup repositories to have Wiki by default?');
}

function chooseDefaultPrivate() {
    return cli.boolean('Setup repositories to be private by default?');
}