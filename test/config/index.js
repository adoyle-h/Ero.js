'use strict';

process.env.NODE_CONFIG_DIR = __dirname;
var config = require('config');
delete process.env.NODE_CONFIG_DIR;

module.exports = config;