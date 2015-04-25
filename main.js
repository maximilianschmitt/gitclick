'use strict';

var iojs = require('is-iojs');

module.exports = iojs ? require('./src/main') : require('./es5/main');