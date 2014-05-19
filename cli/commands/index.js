'use strict';

var _        = require('underscore');
var minimist = require('minimist');
var argv     = minimist(process.argv.slice(2));
var insert   = require('./insert');
var remove   = require('./remove');
var list     = require('./list');

module.exports = function(gitclick) {
	if (_.contains(argv._, 'add')) {
		return insert(gitclick);
	}

	if (_.contains(argv._, 'list')) {
		return list(gitclick);
	}

	if (_.contains(argv._, 'remove') || _.contains(argv._, 'delete')) {
		return remove(gitclick);
	}

	return insert(gitclick);
};