/* global describe, it, before, beforeEach */
'use strict';

var expect        = require('chai').expect;
var rewire        = require('rewire');
var Datastore     = require('nedb');
var Promise       = require('bluebird');
var gutil         = require('gitclick-util');
var BoxRepository = rewire('../lib/box-repository');

describe('BoxRepository', function() {
	var db, boxRepository;
	var fakeConfig = { defaults: { issues: true, private: false, wiki: true }, auth: { type: 'fake' } };

	before(function() {
		// mock nedb with an in-memory configuration
		BoxRepository.__set__('Datastore', function(location) {
			db = new Datastore();
			db.__boxesLocation__ = location;
			return db;
		});
	});

	beforeEach(function(done) {
		boxRepository = new BoxRepository('/some/folder/gitclick-boxes.db');
		boxRepository.load().then(done);
	});

	it('should insert boxes to the configured location', function() {
		expect(boxRepository.db.__boxesLocation__).to.equal('/some/folder/gitclick-boxes.db');
	});

	it('should insert boxes', function(done) {
		boxRepository.insert('my-box', { name: 'some-provider', config: fakeConfig })
		.then(function(box) {
			expect(box).to.deep.equal({
				name: 'my-box',
				provider: { name: 'some-provider', config: fakeConfig }
			});

			done();
		});
	});

	it('should not insert boxes with the same name', function(done) {
		boxRepository.insert('my-box', { name: 'some-provider', config: fakeConfig })
		.then(function() {
			return boxRepository.insert('my-box', { name: 'another-provider', config: fakeConfig });
		})
		.catch(function(err) {
			expect(err).to.be.an.instanceOf(gutil.errors.BoxExistsError);

			done();
		});
	});

	it('should get boxes', function(done) {
		boxRepository.insert('my-box', { name: 'some-provider', config: fakeConfig })
		.then(function() {
			return boxRepository.get('my-box');
		})
		.then(function(box) {
			expect(box).to.deep.equal({
				name: 'my-box',
				provider: { name: 'some-provider', config: fakeConfig }
			});

			done();
		});
	});

	it('should remove boxes', function(done) {
		var removed = false;
		boxRepository.insert('my-box', { name: 'some-provider', config: fakeConfig })
		.then(function() {
			return boxRepository.remove('my-box');
		})
		.then(function() {
			removed = true;
		})
		.then(function() {
			return boxRepository.get('my-box');
		})
		.catch(function(err) {
			expect(removed).to.equal(true);
			expect(err).to.be.an.instanceOf(gutil.errors.BoxNotFoundError);

			done();
		});
	});

	it('should get all boxes', function(done) {
		Promise.all([
			boxRepository.insert('my-box', { name: 'some-provider', config: fakeConfig }),
			boxRepository.insert('another-box', { name: 'some-provider', config: fakeConfig }),
			boxRepository.insert('one-more-box', { name: 'some-provider', config: fakeConfig })
		])
		.then(boxRepository.getAll.bind(boxRepository))
		.then(function(boxes) {
			expect(boxes.length).to.equal(3);
			done();
		});
	});
});