'use strict';

var cli        = require('../../util');
var _          = require('underscore');
var spaceAlign = require('space-align');

module.exports = function(gitclick) {
    gitclick.load()
    .then(function() {
        return gitclick.boxes.getAll();
    })
    .then(function(boxes) {
        if (boxes.length <= 0) {
            cli.printSuccess('Add your first box by typing "gitclick box add".');
            return;
        }

        cli.printSuccess('Here are all your boxes:');

        var data = [];
        boxes.forEach(function(box) {
            var defaults = [];

            if (box.provider.config.defaults.issues) defaults.push('issues');
            if (box.provider.config.defaults.wiki) defaults.push('wiki');
            if (box.provider.config.defaults.private) defaults.push('private');
            else defaults.push('public');

            data.push([box.name, box.provider.name, '(' + defaults.join(', ') + ')']);
        });

        var alignedData = spaceAlign(data);
        alignedData.forEach(function(row) {
            console.log(row);
        });
    });
};