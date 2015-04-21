/* global describe, it */
'use strict';

const childProcessMock = {
  exec: function(cmd, opts, cb) {
    childProcessMock.exec.cmd = cmd;
    childProcessMock.exec.opts = opts;
    cb(null);
  }
};

const chai = require('chai');
const expect = chai.expect;
const proxyquire = require('proxyquire');
const git = proxyquire('../../lib/git', { child_process: childProcessMock });

chai.use(require('chai-as-promised'));

describe('git', function() {
  it('exposes a factory function', function() {
    expect(git).to.be.a('function');
  });

  describe('setRemote', function() {
    it('sets remote with specified name and url', function() {
      return expect(git().setRemote('origin', 'https://some.url'))
        .to.eventually.be.fulfilled.then(checkCmd);

      function checkCmd() {
        expect(childProcessMock.exec.cmd).to.equal('git remote add origin https://some.url');
      }
    });

    it('issues command at specified cwd', function() {
      return expect(git(process.cwd()).setRemote('origin', 'https://some.url'))
        .to.eventually.be.fulfilled.then(checkCmd);

      function checkCmd() {
        expect(childProcessMock.exec.opts).to.deep.equal({ cwd: process.cwd() });
      }
    });
  });
});