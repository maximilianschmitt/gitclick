/* global describe, it, before */
'use strict';

var expect         = require('chai').expect;
var ProviderLoader = require('../lib/provider-loader');

describe('ProviderLoader', function() {
	it('should load providers', function() {
		var provider = ProviderLoader.load({ name: 'github', config: { defaults: { issues: true, private: false, wiki: true }, auth: { type: 'fake' } } });
		expect(provider).to.be.an.instanceOf(require('gitclick-provider-github'));
	});
});