'use strict';

var FS = require('fs');
var Path = require('path');

function traverseFilesSync(dirPath, iteratee, opts) {
    var recursive = opts.recursive;

    FS.readdirSync(dirPath).forEach(function(filename) {
        var filePath = Path.join(dirPath, filename);
        if (recursive && FS.statSync(filePath).isDirectory()) {
            return traverseFilesSync(filePath, iteratee, opts);
        }
        iteratee(filename);
    });
}

exports.traverseFilesSync = traverseFilesSync;
