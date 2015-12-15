'use strict';

/**
 * list all gulp files
 */

/**
 * @param  {Object}  gulp    gulp
 * @param  {Object}  config  config for gulp
 * @param  {Object}  LL      lazy loader for requiring libraries
 * @param  {Object}  args    the arguments of command line
 */
module.exports = function(gulp, config, LL, args) {  // eslint-disable-line
    gulp.task('tasks', function() {
        var tasks = Object.keys(gulp.tasks);
        var task;
        var map = {'Basics': []};
        var category;
        for (var i = tasks.length - 1; i >= 0; i--) {
            task = tasks[i];
            var arr = task.split(':');
            if (arr.length === 1) {
                category = map.Basics;
            } else {
                category = map[arr[0]];
                if (!category) category = map[arr[0]] = [];
            }
            category.push(task);
        }

        var str = JSON.stringify(map, null, 4);
        /* eslint no-console: 0 */
        console.log(str.replace(/["\[\],\{\}]/g, ''));
    });
};
