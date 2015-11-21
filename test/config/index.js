'use strict';

var Path = require('path');
process.env.NODE_CONFIG_DIR = Path.resolve(__dirname);
var config = require('config');
delete process.env.NODE_CONFIG_DIR;

module.exports = config;