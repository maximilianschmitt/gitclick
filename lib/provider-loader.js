'use strict';

var Promise = require('bluebird');

module.exports = {
	// future release: load global gitclick-provider-{options.name} modules
	// use requireg-module
	load: function(options) {
		var Provider = this.require(options.name);
		return new Provider(options.config);
	},
	require: function(provider) {
		return require('gitclick-provider-' + provider);
	},
	exists: function(provider) {
		try {
			this.require(provider);
			return Promise.resolve(true);
		} catch(err) {
			return Promise.resolve(false);
		}
	}
};