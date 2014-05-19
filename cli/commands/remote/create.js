'use strict';

var path             = require('path');
var argv             = require('minimist')(process.argv.slice(3));
var _                = require('underscore');
var cli              = require('../../util');
var gutil            = require('gitclick-util');
var ValidationError  = gutil.errors.ValidationError;
var ProviderError    = gutil.errors.ProviderError;
var BoxNotFoundError = gutil.errors.BoxNotFoundError;

function createRemote(gitclick) {
    try {
        var options = createRemote.parseArgv(argv);

        return gitclick.load()
        .then(function() {
            return gitclick.createRepository(options.box, options.repository);
        })
        .then(function(repository) {
            cli.printSuccess(repository.owner + '/' + repository.name + ' successfully created.');
            cli.print('Clone URL: ' + repository.cloneUrl);
            cli.print('SSH URL: ' + repository.sshUrl);
        })
        .catch(ProviderError, function(err) {
            cli.printError('Your provider responded with an Error:');
            cli.print(err.message);

            if (err.errors) {
                err.errors.forEach(function(e) {
                    cli.print('- ' + e.message);
                });
            }
        })
        .catch(BoxNotFoundError, function(err) {
            cli.printError('Box \'' + options.box + '\' was not found.');
        });
    } catch(err) {
        if (err instanceof ValidationError) {
            return cli.printError(err.message);
        }

        throw err;
    }
}

createRemote.parseArgv = function(argv) {
    var constructor = argv._[0];

    if (!constructor) {
        throw new ValidationError('You must specify a box');
    }

    var options = createRemote.parseConstructor(constructor);
    options.repository = _.extend(createRemote.parseRepositoryArgs(argv), options.repository);

    return options;
};

createRemote.parseRepositoryArgs = function(input) {
    var options = {};

    if (typeof input.private !== 'undefined') options.private = input.private;
    if (typeof input.r !== 'undefined') options.private = input.r;

    if (typeof input.o !== 'undefined') options.private = !JSON.parse(input.o);
    if (typeof input.public !== 'undefined') options.private = !JSON.parse(input.public); // input.public is a string

    if (typeof input.i !== 'undefined') options.issues = input.i;
    if (typeof input.issues !== 'undefined') options.issues = input.issues;

    if (typeof input.w !== 'undefined') options.wiki = input.w;
    if (typeof input.wiki !== 'undefined') options.wiki = input.wiki;

    return options;
};

createRemote.parseConstructor = function(input) {
    var config = { repository: {} };

    var colon = input.indexOf(':');
    if (colon === -1) {
        config.box = input;
        config.repository.name = path.basename(process.env.PWD);

        return config;
    }

    config.box = input.substr(0, colon);

    var slash = input.indexOf('/');
    if (slash === -1) {
        config.repository.name = input.substr(colon + 1, input.length - 1);

        return config;
    }

    config.repository.organisation = input.substr(colon + 1, slash - (colon + 1));
    config.repository.name         = input.substr(slash + 1, input.length - (slash + 1));

    return config;
};

module.exports = createRemote;