'use strict';

var Datastore = require('nedb');
var _         = require('underscore');
var Promise   = require('bluebird');
var gutil     = require('gitclick-util');

var BoxRepository = function(location) {
	this.location = location;
};

BoxRepository.prototype = {
	load: function() {
		var db = this.db = new Datastore(this.location);

		Promise.promisifyAll(db);

		return db.loadDatabaseAsync()
		.then(function() {
			return db.ensureIndexAsync({ fieldName: 'name', unique: true });
		});
	},

	get: function(name) {
		return this.db.findOneAsync({ name: name }).then(this.parseDocument);
	},

	getAll: function() {
		var parseDocument = this.parseDocument;

		return this.db.findAsync({}).then(function(docs) {
			return _.map(docs, parseDocument);
		});
	},

	insert: function(name, provider) {
		if (!name || !provider) throw new TypeError('Missing arguments');
		if (!provider.name) throw new TypeError('You must specify a name for your provider');
		if (!provider.config) throw new TypeError('You must specify a provider-configuration for your box');
		if (!provider.config.auth) throw new TypeError('Auth configuration not specified');
		if (!provider.config.auth.type) throw new TypeError('Auth type not specified');
		if (!provider.config.defaults) throw new TypeError('Defaults not specified');

		return this.db.insertAsync({ name: name, provider: provider })
			.then(this.parseDocument)
			.catch(function(err) {
				if (err.errorType === 'uniqueViolated') {
					throw new gutil.errors.BoxExistsError('A box with this name already exists');
				}

				throw err;
			});
	},

	remove: function(name) {
		return this.db.removeAsync({ name: name });
	},

	parseDocument: function(doc) {
		if (doc === null) throw new gutil.errors.BoxNotFoundError();
		return _.omit(doc, '_id');
	}
};

module.exports = BoxRepository;