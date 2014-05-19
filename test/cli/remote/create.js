/* global describe, it */
'use strict';

var expect = require('chai').expect;
var createRemote = require('../../../cli/commands/remote/create');

describe('create remote', function() {
	it('should parse constructor', function() {
		var config = createRemote.parseConstructor('test-box:test-repo');
		expect(config).to.deep.equal({ box: 'test-box', repository: { name: 'test-repo' } });

		config = createRemote.parseConstructor('test-box:test-organisation/test-repo');
		expect(config).to.deep.equal({ box: 'test-box', repository: { organisation: 'test-organisation', name: 'test-repo' } });

		config = createRemote.parseConstructor('test-box');
		expect(config).to.deep.equal({ box: 'test-box', repository: { name: 'gitclick' } });
	});

	it('should parse repository args', function() {
		var config = createRemote.parseRepositoryArgs({ public: false });
		expect(config).to.deep.equal({ private: true });

		config = createRemote.parseRepositoryArgs({ public: true });
		expect(config).to.deep.equal({ private: false });

		config = createRemote.parseRepositoryArgs({ private: true });
		expect(config).to.deep.equal({ private: true });

		config = createRemote.parseRepositoryArgs({ private: false });
		expect(config).to.deep.equal({ private: false });

		config = createRemote.parseRepositoryArgs({ issues: false });
		expect(config).to.deep.equal({ issues: false });

		config = createRemote.parseRepositoryArgs({ issues: true });
		expect(config).to.deep.equal({ issues: true });

		config = createRemote.parseRepositoryArgs({ i: true });
		expect(config).to.deep.equal({ issues: true });

		config = createRemote.parseRepositoryArgs({ w: true });
		expect(config).to.deep.equal({ wiki: true });

		config = createRemote.parseRepositoryArgs({ wiki: true });
		expect(config).to.deep.equal({ wiki: true });

		config = createRemote.parseRepositoryArgs({ wiki: false });
		expect(config).to.deep.equal({ wiki: false });
	});

	it('should parse argv', function() {
		var argv = {
			_: ['test-box:test-repo'],
			i: true,
			w: true,
			r: true
		};

		var config = createRemote.parseArgv(argv);

		expect(config).to.deep.equal({
			box: 'test-box',
			repository: {
				name: 'test-repo',
				issues: true,
				wiki: true,
				private: true
			}
		});
	});
});