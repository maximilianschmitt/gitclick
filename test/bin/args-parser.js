/* global describe, it */
'use strict';

const argsParser = require('../../bin/args-parser');
const expect = require('chai').expect;

describe('argsParser', function() {
  describe('create', function() {
    it('returns repository and account', function() {
      const opts = argsParser.create({ _: ['create', 'repo-name', 'on', 'some-account'] });
      expect(opts).to.deep.equal({
        repository: 'repo-name',
        account: 'some-account',
        issues: true,
        wiki: true,
        private: false
      });
    });

    it('is flexible with respect to positioning of repository and account', function() {
      const opts = argsParser.create({ _: ['create', 'on', 'some-account', 'repo-name'] });
      expect(opts).to.deep.equal({
        repository: 'repo-name',
        account: 'some-account',
        issues: true,
        wiki: true,
        private: false
      });
    });

    it('works if no repository is set', function() {
      const opts = argsParser.create({ _: ['create', 'on', 'some-account'] });
      expect(opts).to.deep.equal({
        repository: null,
        account: 'some-account',
        issues: true,
        wiki: true,
        private: false
      });
    });

    it('works if no account is set', function() {
      const opts = argsParser.create({ _: ['create', 'repo-name'] });
      expect(opts).to.deep.equal({
        repository: 'repo-name',
        account: null,
        issues: true,
        wiki: true,
        private: false
      });
    });

    it('works if nothing is set', function() {
      const opts = argsParser.create({ _: ['create'] });
      expect(opts).to.deep.equal({
        repository: null,
        account: null,
        issues: true,
        wiki: true,
        private: false
      });
    });

    it('can have no issues', function() {
      const opts = argsParser.create({ _: ['create'], issues: false });
      expect(opts).to.deep.equal({
        repository: null,
        account: null,
        issues: false,
        wiki: true,
        private: false
      });
    });

    it('can have no wiki', function() {
      const opts = argsParser.create({ _: ['create'], wiki: false });
      expect(opts).to.deep.equal({
        repository: null,
        account: null,
        issues: true,
        wiki: false,
        private: false
      });
    });

    it('can be private', function() {
      const opts = argsParser.create({ _: ['create'], private: true });
      expect(opts).to.deep.equal({
        repository: null,
        account: null,
        issues: true,
        wiki: true,
        private: true
      });
    });
  });
});