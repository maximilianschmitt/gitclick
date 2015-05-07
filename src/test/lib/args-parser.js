/* global describe, it */
'use strict';

const argsParser = require('../../lib/args-parser');
const expect = require('chai').expect;

describe('argsParser', function() {
  describe('create', function() {
    it('returns repository and account', function() {
      const opts = argsParser.create({ _: ['create', 'repo-name', 'on', 'some-account'] });
      expect(opts).to.deep.equal({
        team: null,
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
        team: null,
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
        team: null,
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
        team: null,
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
        team: null,
        repository: null,
        account: null,
        issues: true,
        wiki: true,
        private: false
      });
    });

    it('can have a team', function() {
      const opts = argsParser.create({ _: ['create', 'as', 'some-team'] });
      expect(opts).to.deep.equal({
        team: 'some-team',
        repository: null,
        account: null,
        issues: true,
        wiki: true,
        private: false
      });
    });

    it('can have a team, account and repositoriy specified', function() {
      const opts = argsParser.create({ _: ['create', 'some-repo', 'as', 'some-team', 'on', 'some-account'] });
      expect(opts).to.deep.equal({
        team: 'some-team',
        repository: 'some-repo',
        account: 'some-account',
        issues: true,
        wiki: true,
        private: false
      });
    });

    it('can have a team, account and repositoriy specified in any order', function() {
      const opts = argsParser.create({ _: ['create', 'on', 'some-account', 'some-repo', 'as', 'some-team'] });
      expect(opts).to.deep.equal({
        team: 'some-team',
        repository: 'some-repo',
        account: 'some-account',
        issues: true,
        wiki: true,
        private: false
      });
    });

    it('can have no issues', function() {
      const opts = argsParser.create({ _: ['create'], issues: false });
      expect(opts).to.deep.equal({
        team: null,
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
        team: null,
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
        team: null,
        repository: null,
        account: null,
        issues: true,
        wiki: true,
        private: true
      });
    });

    it('can set remote', function() {
      const opts = argsParser.create({ _: ['create'], 'set-remote': true });
      expect(opts).to.deep.equal({
        team: null,
        repository: null,
        account: null,
        issues: true,
        wiki: true,
        private: false,
        setRemote: 'origin'
      });
    });

    it('can specify remote', function() {
      const opts = argsParser.create({ _: ['create'], 'set-remote': 'remote-name' });
      expect(opts).to.deep.equal({
        team: null,
        repository: null,
        account: null,
        issues: true,
        wiki: true,
        private: false,
        setRemote: 'remote-name'
      });
    });
  });
});
