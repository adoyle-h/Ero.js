'use strict';

var util = require('../../lib/util');
var Fakers = require('./fakers');

exports.reset = function(Errors) {
    var keys = util.keys(Fakers.definitions);
    util.each(keys, function(key) {
        delete Errors[key];
    });
    Errors.template = null;
};
