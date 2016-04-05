'use strict';
/**
 * display all gulp tasks
 */

/**
 * @param  {Object}  gulp    The gulp object
 * @param  {Object}  config  The configuration for gulp tasks. To get a property using `config.a.b.c` or `config.get('a.b.c')`
 * @param  {Object}  LL      Lazy required libraries and other data
 * @param  {Object}  args    The parsed arguments from comment line
 */
module.exports = function(gulp, config, LL, args) {  // eslint-disable-line no-unused-vars
    gulp.task('tasks', function() {
        var tasks = Object.keys(gulp.tasks);
        var map = {'Basics': []};
        var task, category, i, arr;
        for (i = tasks.length - 1; i >= 0; i--) {
            task = tasks[i];
            arr = task.split(':');
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
