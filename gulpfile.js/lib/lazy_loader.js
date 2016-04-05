'use strict';

var Path = require('path');

// Lazy Loader
var LL = {
    internals: {},
    set: function(name, path) {
        if (path.indexOf('.') === 0) {
            path = Path.resolve(path);
        }

        this.internals[name] = {
            path: path,
            requirement: null,
        };

        Object.defineProperty(this, name, {
            get: function() {
                var internal = this.internals[name];
                var requirement = internal.requirement;
                if (!requirement) {
                    requirement = internal.requirement = require(internal.path);
                }
                return requirement;
            },
        });
    },
    setMulti: function(params) {
        var propertys = Object.keys(params);
        var property, i;
        for (i = propertys.length - 1; i >= 0; i--) {
            property = propertys[i];
            this.set(property, params[property]);
        }
    },
    reset: function(name) {
        var internal = this.internals[name];
        internal.requirement = null;
        var path = require.resolve(internal.path);
        delete require.cache[path];
    },
    reload: function(name) {
        this.reset(name);
        return this[name];
    },
};

exports = module.exports = LL;
