'use strict';

const log = function() {
  console.log.apply(console, arguments);
};

module.exports = log;