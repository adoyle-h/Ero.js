'use strict';

var gulp = require('gulp');
var minimist = require('minimist');
var Path = require('path');

var config = require('./config');
var requirements = require('./require');
var LL = require('./lib/lazy_loader');
var traverseFilesSync = require('./lib/traverseFiles').traverseFilesSync;
var GULP_TASKS_PATH = Path.resolve(__dirname, './tasks/');

LL.setMulti(requirements);

var args = minimist(process.argv.slice(2));

traverseFilesSync(GULP_TASKS_PATH, function(filename) {
    var task = require(Path.resolve(GULP_TASKS_PATH, filename));
    task(gulp, config, LL, args);
}, {
    recursive: true,
});
