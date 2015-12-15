'use strict';

/**
 * @param  {Object}  gulp    gulp
 * @param  {Object}  config  config for gulp
 * @param  {Object}  LL      lazy loader for requiring libraries
 * @param  {Object}  args    the arguments of command line
 */
module.exports = function(gulp, config, LL, args) {  // eslint-disable-line
    gulp.task('release:rebuild-lodash', function() {
        var CP = LL.CP;
        var lodash = LL.lodash;

        var command = 'grep -roh -E "util\.\\w+" --exclude lib/lodash.js lib/*.js | cut -c 6- | sort -u';
        var results = CP.execSync(command, {
            cwd: process.cwd(),
            encoding: 'utf-8',
        });

        var otherUtilFunctions = ['format', 'inspect', 'inherits', 'deprecate', 'sprintf', 'vsprintf'];
        var utilFunctions = results.slice(0, -1).split('\n');
        var lodashFunctions = lodash.difference(utilFunctions, otherUtilFunctions);
        lodashFunctions.push('runInContext');

        var command2 = 'lodash exports=node include=' + lodashFunctions.join(',') + ' -d -o ./lib/lodash.js';
        console.info('Exec:', command2);
        CP.execSync(command2);
    });

    gulp.task('release', ['release:rebuild-lodash']);
};
