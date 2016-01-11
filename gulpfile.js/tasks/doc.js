'use strict';

/**
 * @param  {Object}  gulp    The gulp object
 * @param  {Object}  config  The configuration for gulp tasks. To get a property using `config.a.b.c` or `config.get('a.b.c')`
 * @param  {Object}  LL      Lazy required libraries and other data
 * @param  {Object}  args    The parsed arguments from comment line
 */
module.exports = function(gulp, config, LL, args) {  // eslint-disable-line no-unused-vars
    gulp.task('doc:api', ['clean:doc:api'], function(done) {
        LL.CP.exec('jsduck', done);
    });

    /**
     * Generate documents
     *
     * gulp doc [options]
     *
     * options:
     *     -h --help  Show how to use the task
     */
    gulp.task('doc', ['doc:api']);
};
