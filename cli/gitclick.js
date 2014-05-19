#!/usr/bin/env node
'use strict';

var path     = require('path-extra');
var Gitclick = require('../lib/gitclick');
var minimist = require('minimist');
var gutil    = require('gitclick-util');
var _        = require('underscore');
var fs       = require('fs');
var cli      = require('./util');
var argv     = minimist(process.argv);

var gitclick = new Gitclick();

if (_.contains(argv._, 'config') || _.contains(argv._, 'configure')) {
	require('./commands/config')(gitclick);
	return;
}

if (_.contains(argv._, 'box')) {
	load(require('./commands/box'));
	return;
}

if (_.contains(argv._, 'remote') || _.contains(argv._, 'repo')) {
	load(require('./commands/remote'));
	return;
}

if (argv.v || argv.version) {
	var packageJson = require('../package.json');
	cli.print('You are running gitclick version ' + packageJson.version);
	return;
}

function load(loadModule) {
	return gitclick.load()
	.then(function() {
		loadModule(gitclick);
	})
	.catch(gutil.errors.NotConfiguredError, function() {
		cli.printError('gitclick ist not configured. Please run \'gitclick config\'.');
	});
}

cli.doc('gitclick');