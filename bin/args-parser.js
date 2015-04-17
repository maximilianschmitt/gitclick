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
    let iOn = args.indexOf('on');
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

    // get repository
    opts.repository = args[0] || null;

    return opts;
  }
};

module.exports = argsParser;