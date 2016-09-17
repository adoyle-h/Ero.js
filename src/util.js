var lodash = require('lodash');
var nodeUtil = require('util');

var util = lodash.runInContext();

util.mixin(util.pick(nodeUtil, [
    'format', 'inspect', 'inherits', 'deprecate',
]));

util.mixin(util.pick(require('sprintf-js'), ['sprintf', 'vsprintf']));

util.mixin({
    staticMethod: function(dest, name, func) {
        dest.prototype[name] = func;
        dest[name] = func;
    },
});

module.exports = util;
