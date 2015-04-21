'use strict';

const thenify = require('thenify');
const exec = thenify(require('child_process').exec);

const git = function(cwd) {
  return {
    setRemote: function(name, url) {
      return exec(`git remote add ${name} ${url}`, { cwd: cwd });
    }
  };
};

module.exports = git;