'use strict';

var Mocha = require('mocha');
var util = require('lodash');

var config = require('./config');
var globals = require('./globals');
var loadCases = require('./load_cases');

var mocha;

function configMocha(mocha) {
    mocha.globals(util.keys(globals));
    mocha.reporter(config.get('reporter'));
    mocha.ignoreLeaks(config.get('ignoreLeaks'));
    mocha.ui(config.get('ui'));
    mocha.useColors(config.get('colors'));
    mocha.useInlineDiffs(config.get('inlineDiffs'));
    mocha.suite.bail(config.get('bail'));
    mocha.suite.slow(config.get('slow'));
    mocha.suite.timeout(config.get('timeout'));
    if (config.get('grep')) mocha.grep(config.get('grep'));
    if (config.get('invert')) mocha.invert();
    if (config.get('growl')) mocha.growl();
    if (config.get('asyncOnly')) mocha.asyncOnly();
}

function init() {
    mocha = new Mocha();
    configMocha(mocha);

    // set limit of stack trace
    Error.stackTraceLimit = config.get('stackTraceLimit') || Infinity;

    // set globals
    util.each(globals, function(val, key) {
        global[key] = val;
    });

    loadCases(mocha);

    return mocha;
}

exports.init = init;
