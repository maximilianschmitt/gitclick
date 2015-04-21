/* global describe, it */
'use strict';

const c = require('./helpers/test-configs');
const rewire = require('rewire');
const gitclick = rewire('../main');
const chai = require('chai');
const expect = chai.expect;
const fs = require('thenify-all')(require('fs'));

chai.use(require('chai-as-promised'));

const ProviderMock = function(opts) {
  this.opts = opts;

  this.createRepository = function(repository) {
    this.repository = repository;
  };
};

gitclick.__set__('GithubProvider', ProviderMock);
gitclick.__set__('BitbucketProvider', ProviderMock);

describe('gitclick', function() {
  it('exposes a factory function', function() {
    expect(gitclick).to.be.a('function');
  });

  describe('encrypt', function() {
    it('encrypts the contents of the store', function() {
      const gc = gitclick(c.defaultConfigPath, c.password);
      return expect(gc.encrypt().then(readFile).then(toString))
        .to.eventually.equal('w/gYRs08GryHtq/bc/8/w3qzDTyUDwGAAKfAvobKzQs=');

      function readFile() {
        return fs.readFile(c.defaultConfigPath);
      }

      function toString(buff) {
        return buff.toString();
      }
    });

    it('does not encrypt already encrypted stores', function() {
      const gc = gitclick(c.encryptedConfigPath, c.password);
      return expect(gc.encrypt()).to.eventually.be.rejected;
    });
  });
});