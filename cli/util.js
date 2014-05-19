'use strict';

var promptly = require('promptly');
var Promise  = require('bluebird');
var fs       = require('fs');
var path     = require('path');
require('colors');

module.exports = {
    print: function(string) {
        console.log(string);
    },

    printError: function(string) {
        console.log(string.red);
    },

    printSuccess: function(string) {
        console.log(string.green);
    },

    printWarning: function(string) {
        console.log(string.yellow);
    },

    doc: function(file) {
        console.log('\n' + fs.readFileSync(path.join(__dirname, '..', 'docs', 'cli', file + '.txt')) + '\n');
    },

    prompt: Promise.promisify(promptly.prompt),
    choose: Promise.promisify(promptly.choose),
    password: Promise.promisify(promptly.password),
    boolean: Promise.promisify(promptly.confirm)
};