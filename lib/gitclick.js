'use strict';

var _                  = require('underscore');
var path               = require('path-extra');
var Promise            = require('bluebird');
var fs                 = require('fs');
var BoxRepository      = require('./box-repository');
var ProviderLoader     = require('./provider-loader');
var NotConfiguredError = require('gitclick-util').errors.NotConfiguredError;
var touch              = Promise.promisify(require('touch'));

Promise.promisifyAll(fs);

var configPath = path.join(path.homedir(), '.gitclick');

var Gitclick = function() {
};

Gitclick.prototype = {
	createRepository: function(boxName, options) {
		var providers = this.providers;

		return this.boxes.get(boxName)
		.then(function(box) {
			var provider = providers.load(box.provider);
			
			return provider.createRepository(options);
		});
	},

	configure: function(options) {
		if (!options) throw new TypeError('Missing arguments');
		if (!options.boxesLocation) throw new TypeError('No box store specified');
		
		var config = { boxStore: path.join(options.boxesLocation, '.gitclick-boxes') };
		var instance = this;

		return touch(config.boxStore)
		.then(function() {
			return fs.writeFileAsync(configPath, JSON.stringify(config));
		})
		.then(function() {
			instance.config = config;
			return config;
		});
	},

	isConfigured: function() {
		if (this.config) return Promise.resolve(true);

		return new Promise(function(resolve, reject) {
			fs.exists(configPath, resolve);
		});
	},

	getConfig: function() {
		if (this.config) return Promise.resolve(this.config);

		return this.isConfigured()
		.then(function(exists) {
			if (exists) return fs.readFileAsync(configPath);

			throw new NotConfiguredError();
		})
		.then(JSON.parse);
	},

	load: function() {
		var instance = this;

		return this.getConfig()
		.then(function(config) {
			instance.providers = ProviderLoader;
			instance.boxes     = new BoxRepository(config.boxStore);
			
			return instance.boxes.load().then(instance._setLoaded.bind(instance));
		});
	},

	configPath: function() {
		return configPath;
	},

	isLoaded: function() {
		return this._loaded;
	},

	_setLoaded: function() {
		this._loaded = true;
	}
};

module.exports = Gitclick;