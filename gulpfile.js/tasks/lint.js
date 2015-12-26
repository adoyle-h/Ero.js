'use strict';

/**
 * @param  {Object}  gulp    The gulp object
 * @param  {Object}  config  The configuration for gulp tasks. To get a property using `config.a.b.c` or `config.get('a.b.c')`
 * @param  {Object}  LL      Lazy required libraries and other data
 * @param  {Object}  args    The parsed arguments from comment line
 */
module.exports = function(gulp, config, LL, args) {  // eslint-disable-line no-unused-vars
    gulp.task('lint', function() {
        var eslint = LL.eslint;
        var cached = LL.cached;

        var opts = config.get('tasks.lint.eslintOptions');
        if (args.fix || args.f) opts.fix = true;

        return gulp.src(config.get('tasks.lint.src'))
            .pipe(cached('lint'))
            .pipe(eslint(opts))
            .pipe(eslint.format())
            .pipe(eslint.failAfterError());
    });
};
