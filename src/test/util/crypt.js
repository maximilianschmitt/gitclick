'use strict';

const crypto = require('crypto');
const argv = require('minimist')(process.argv.slice(2));

if (argv.e) {
  console.log(encrypt(argv.e, argv.p));
}

if (argv.d) {
  console.log(decrypt(argv.d, argv.p));
}

function encrypt(text, password) {
  const cipher = crypto.createCipher('aes-256-cbc', password);
  return cipher.update(text, 'utf8', 'base64') + cipher.final('base64');
}

function decrypt(encrypted, password) {
  const decipher = crypto.createDecipher('aes-256-cbc', password);
  return decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8');
}