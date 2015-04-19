'use strict';

const fs = require('thenify-all')(require('fs'), {});
const crypto = require('crypto');

const jsonStore = {
  // checks if a store at `filePath` exists
  // if not, create it with `content`
  ensureExists: function(filePath, content) {
    return fs
      .readFile(filePath)
      .catch(function(err) {
        if (err.code === 'ENOENT') {
          return fs.writeFile(filePath, content ? JSON.stringify(content) : '');
        }

        throw err;
      });
  },

  // reads JSON from `filePath`
  // decrypts if `password` is provided
  read: function(filePath, password) {
    return fs.readFile(filePath).then(parse);

    function parse(text) {
      if (password) {
        text = decrypt(text.toString(), password);
      }

      return JSON.parse(text);
    }
  },

  // write JSON `content` to `filePath`
  // encrypts if `password` is provided
  write: function(filePath, content, password) {
    return fs.writeFile(filePath, JSON.stringify(content));
  }
};

function encrypt(text, password) {
  var cipher = crypto.createCipher('aes-256-cbc', password);
  return cipher.update(text, 'utf8', 'base64') + cipher.final('base64');
}

function decrypt(encrypted, password) {
  var decipher = crypto.createDecipher('aes-256-cbc', password);
  return decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8');
}

module.exports = jsonStore;