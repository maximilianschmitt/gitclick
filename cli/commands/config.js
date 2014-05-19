'use strict';

var path    = require('path-extra');
var cli     = require('../util');
var Promise = require('bluebird');

module.exports = function(gitclick) {
	return gitclick.isConfigured().then(function(configured) {
		if (!configured) {
			cli.print('Where should we store your boxes? (default: ' + path.homedir() + ')');
			cli.prompt('Boxes location:', { default: path.homedir() })
			.then(function(dir) {
				return gitclick.configure({ boxesLocation: dir });
			})
			.then(function(config) {
				cli.printSuccess('gitclick was successfully configured!');
			})
			.catch(function(err) {
				cli.printError('Something went wrong while configuring gitclick :(');
				console.error(err.message);
			});
		} else {
			gitclick.getConfig().then(function(config) {
				cli.printSuccess('gitclick is already configured.');
				cli.print('Your configuration file is located at: ' + gitclick.configPath());
				cli.print('Your boxes are located at: ' + config.boxStore);
			});
		}
	});
};