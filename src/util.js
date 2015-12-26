'use strict';

var lodash = require('lodash');
var nodeUtil = require('util');

var util = lodash.runInContext();

util.mixin(util.pick(nodeUtil, [
    'format', 'inspect', 'inherits', 'deprecate',
]));

util.mixin(util.pick(require('sprintf-js'), ['sprintf', 'vsprintf']));

module.exports = util;
