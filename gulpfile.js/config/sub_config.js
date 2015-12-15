'use strict';

var _SUPPRESS_NO_CONFIG_WARNING = process.env.SUPPRESS_NO_CONFIG_WARNING;
process.env.SUPPRESS_NO_CONFIG_WARNING = 'yes';

var FS = require('fs');
var Path = require('path');
var Config = require('config');

if (_SUPPRESS_NO_CONFIG_WARNING === undefined) {
    delete process.env.SUPPRESS_NO_CONFIG_WARNING;
}

function loadFile(key, path) {
    try {
        FS.accessSync(path, FS.F_OK | FS.R_OK);
        return require(path);
    } catch (e) {
        if (e.message !== 'ENOENT, no such file or directory \'' + path + '\'') {
            throw e;
        }
    }
}

/**
 * load your sub-config files
 *
 * @example
 * // Assume that there are two files 'test/config/default.js', 'test/config/local.js',
 * // and the codes in 'test/config/index.js':
 * load('test', __dirname, ['default.js', 'local.js']);
 *
 * @param  {String} key           the key name for the sub-config.
 * @param  {String} fromPath      a absolute path to sub-config folder.
 * @param  {Array<String>} relativePaths  the paths of config files, which relative to `fromPath`.
 *                                        the latter will overwrite the former.
 * @return {Object}               the sub-config object.
 * @method load(key, fromPath, relativePaths)
 */
function load(key, fromPath, relativePaths) {
    var conf;
    relativePaths.forEach(function(relativePath, index) {
        var path = Path.resolve(fromPath, relativePath);
        var config = loadFile(key, path);
        if (index === 0) {
            conf = config;
        } else {
            Config.util.extendDeep(conf, config);
        }
    }, []);

    Config.util.setModuleDefaults(key, conf);
    return Config[key];
}

exports.load = load;
