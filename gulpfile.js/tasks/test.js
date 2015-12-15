'use strict';

/**
 * @param  {Object}  gulp    gulp
 * @param  {Object}  config  config for gulp
 * @param  {Object}  LL      lazy loader for requiring libraries
 * @param  {Object}  args    the arguments of command line
 */
module.exports = function(gulp, config, LL, args) {  // eslint-disable-line
    gulp.task('test', function(callback) {
        var mocha = require('../../test');
        mocha.run(callback);
    });
};
