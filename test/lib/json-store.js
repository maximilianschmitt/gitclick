/* global describe, it */
'use strict';

const path = require('path');
const jsonStore = require('../../lib/json-store');
const chai = require('chai');
const fs = require('thenify-all')(require('fs'), {});
const c = require('../helpers/test-configs');
const expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('jsonStore', function() {
  describe('ensureExists', function() {
    it('returns a fulfilled promise if the file exists', function() {
      return expect(fs.writeFile(c.nonExistingConfigPath, '').then(ensureExists))
        .to.eventually.be.fulfilled;

      function ensureExists() {
        return jsonStore.ensureExists(c.nonExistingConfigPath);
      }
    });

    it('creates the file if it does not exist', function() {
      return expect(jsonStore.ensureExists(c.nonExistingConfigPath).then(readFile))
        .to.eventually.be.fulfilled;

      function readFile() {
        return fs.readFile(c.nonExistingConfigPath);
      }
    });

    it('creates the file with specified JSON `content` if it does not exist', function() {
      return expect(jsonStore.ensureExists(c.nonExistingConfigPath, { some: 'content' }).then(readFile).then(JSON.parse))
        .to.eventually.deep.equal({ some: 'content' });

      function readFile() {
        return fs.readFile(c.nonExistingConfigPath);
      }
    });

    it('does not overwrite the file if it already exists', function() {
      const originalContent = { original: 'content is preserved' };

      return expect(createFile().then(ensureExists).then(readFile).then(JSON.parse))
        .to.eventually.deep.equal(originalContent);

      function createFile() {
        return fs.writeFile(c.nonExistingConfigPath, JSON.stringify(originalContent));
      }

      function ensureExists() {
        return jsonStore.ensureExists(c.nonExistingConfigPath, { some: 'content' });
      }

      function readFile() {
        return fs.readFile(c.nonExistingConfigPath);
      }
    });
  });

  describe('read', function() {
    it('parses file contents as JSON', function() {
      return expect(jsonStore.read(c.defaultConfigPath))
        .to.eventually.deep.equal({ account: null, accounts: {} });
    });

    it('parses encrypted file\'s contents as JSON if `password` is provided', function() {
      return expect(jsonStore.read(c.encryptedConfigPath, c.password))
        .to.eventually.deep.equal({ account: null, accounts: {} });
    });
  });

  describe('write', function() {
    it('writes JSON to file', function() {
      expect(jsonStore.write(c.nonExistingConfigPath, { account: null, accounts: {} }).then(readFile).then(JSON.parse))
        .to.eventually.deep.equal({ account: null, accounts: {} });

      function readFile() {
        return fs.readFile(c.nonExistingConfigPath);
      }
    });

    it('encrypts JSON and writes it to file if `password` is provided', function() {
      expect(jsonStore.write(c.nonExistingConfigPath, { account: null, accounts: {} }, c.password).then(readFile))
        .to.eventually.deep.equal('SniP8lAKRBGS7jwuIIu6COxM4VL/XrhnlE9SoH7O5XrBERa+7rReF57iU2IRAbAM');

      function readFile() {
        return fs.readFile(c.nonExistingConfigPath);
      }
    });
  });
});