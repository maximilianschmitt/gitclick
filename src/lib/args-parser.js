'use strict';

const argsParser = {
  create: function(argv) {
    const args = argv._.slice(1);
    
    const opts = {
      private: !!argv.private,
      issues: typeof argv.issues === 'boolean' ? argv.issues : true,
      wiki: typeof argv.wiki === 'boolean' ? argv.wiki : true
    };
    
    // get account
    const iOn = args.indexOf('on');
    if (iOn !== -1) {
      opts.account = args[iOn + 1] || null;
      // clean up
      if (args[iOn + 1]) {
        args.splice(iOn + 1, 1);
      }
      args.splice(iOn, 1);
    } else {
      opts.account = null;
    }

    // get team
    const iAs = args.indexOf('as');
    if (iAs !== -1) {
      opts.team = args[iAs + 1] || null;
      // clean up
      if (opts.team) {
        args.splice(iAs + 1, 1);
      }
      args.splice(iAs, 1);
    } else {
      opts.team = null;
    }

    // get repository
    opts.repository = args[0] || null;

    if (argv['set-remote']) {
      opts.setRemote = typeof argv['set-remote'] === 'boolean' ? 'origin' : argv['set-remote'];
    }

    return opts;
  }
};

module.exports = argsParser;
