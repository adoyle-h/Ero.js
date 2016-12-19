'use strict';

/**
 * @param  {Object}  gulp    The gulp object
 * @param  {Object}  config  The configuration for gulp tasks. To get a property using `config.a.b.c` or `config.get('a.b.c')`
 * @param  {Object}  LL      Lazy required libraries and other data
 * @param  {Object}  args    The parsed arguments from comment line
 * @return {undefined}
 */
module.exports = function(gulp, config, LL, args) {  // eslint-disable-line no-unused-vars
    gulp.task('clean:release', function() {
        var del = LL.del;
        return del(config.get('tasks.release.license.dest'));
    });

    gulp.task('clean:npm-package', function() {
        var del = LL.del;
        var packageJSON = LL.packageJSON;
        var Path = LL.Path;
        var util = LL.nodeUtil;
        var dest = Path.resolve(config.get('tasks.release.npm.dest'));
        var destFile = util.format('%s/%s.tgz', dest, packageJSON.name);

        return del(destFile);
    });

    gulp.task('clean:gh-pages', function() {
        var del = LL.del;
        return del(['gh-pages/*', '!gh-pages/.git', '!gh-pages/.gitignore']);
    });

    gulp.task('clean:doc:api', function() {
        var del = LL.del;
        return del('doc/API/*');
    });

    gulp.task('clean:doc', ['clean:doc:api']);

    gulp.task('clean', ['clean:doc', 'clean:release', 'clean:npm-package']);
};
