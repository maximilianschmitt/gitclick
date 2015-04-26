/* global describe, it */
'use strict';

const chai = require('chai');
const stat = require('thenify')(require('fs').stat);
const expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('gitclick', function() {
  it('exists', function() {
    return expect(stat(__dirname + '/../../bin/gitclick')).to.eventually.be.fulfilled;
  });
});