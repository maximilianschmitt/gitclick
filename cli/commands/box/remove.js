'use strict';

var minimist = require('minimist');
var cli      = require('../../util');
var argv     = minimist(process.argv.slice(4));

module.exports = function(gitclick) {
    var boxName = argv._[0];

    if (!boxName) {
        return cli.printError('You must specify the name of the box you would like to remove');
    }

    gitclick.load()
    .then(function() {
        return gitclick.boxes.remove(boxName);
    })
    .then(function() {
        cli.printSuccess('Box \'' + boxName + '\' was successfully removed');
    });
};