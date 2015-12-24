'use strict';

var load = require('config-sp').load;
var config = load(__dirname, ['default.js', 'local.js']);
module.exports = config;
