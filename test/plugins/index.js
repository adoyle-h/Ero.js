'use strict';

var util = require('lodash');

var pluginFileNames = [
];

function loadPlugins() {
    util.each(pluginFileNames, function(filename) {
        var plugin = require('./' + filename);
        var pluginName = filename;
        var a = plugin.after;
        var b = plugin.before;
        var description = '[Plugin] ' + pluginName;

        if (util.isFunction(b)) before(description, b);
        if (util.isFunction(a)) after(description, a);
    });
}

loadPlugins();
