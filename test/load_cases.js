'use strict';

var util = require('lodash');
var walk = require('walkdir');
var Path = require('path');

var config = require('./config');
var folders = config.get('cases');

function addTestCase(mocha, directory) {
    walk.sync(directory, function(filepath, stats) {
        if (stats.isFile()) {
            mocha.addFile(filepath);
        }
    });
}

module.exports = function(mocha) {
    util.each(folders, function(testIt, type) {
        if (!testIt) return undefined;
        var dir = Path.resolve(global.TEST_ROOT, 'cases', type);
        addTestCase(mocha, dir);
    });
};
