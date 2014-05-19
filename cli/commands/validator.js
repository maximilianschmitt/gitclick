'use strict';

var Promise = require('bluebird');
var ValidationError = require('gitclick-util').errors.ValidationError;

module.exports = function(gitclick) {
	return {
		name: function(name) {
			if (name.length <= 0) {
				return Promise.reject(new ValidationError('You must specify a name'));
			}

			if (name.indexOf(' ') != -1) {
				return Promise.reject(new ValidationError('Your name cannot contain spaces'));
			}

			return Promise.resolve(name);
		},
		provider: function(provider) {
			return gitclick.providers.exists(provider)
				.then(function(exists) {
					if (exists) return provider;

					throw new ValidationError('There is no plugin installed for this provider: ' + provider);
				});
		}
	};
};