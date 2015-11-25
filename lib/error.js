'use strict';

if (!Error.captureStackTrace) throw new Error('Error.captureStackTrace does not exist!');

var util = require('./util');
var BE = require('./base_error');
var BaseError = BE.BaseError;

var Errors = {
    template: null,
    OPTIONAL: 0,
    REQUIRED: 1,
};
exports = module.exports = Errors;

exports.setErrorStackSeparator = function(separator) {
    BE.ERROR_STACK_SEPARATOR = separator;
};
exports.setErrorStackSeparator('\n==== Pre-Error-Stack ====\n');

exports.setMessageConnector = function(connector) {
    BE.MESSAGE_CONNECTOR = connector;
};
exports.setMessageConnector(' && ');

/**
 * define a subclass of BaseError
 */
exports.defineError = function(name, definition) {
    if (!Errors.template) throw new Error('You should call setTemplate() first!');

    var E = function() {
        BaseError.apply(this, arguments);
    };
    util.inherits(E, BaseError);

    util.each(Errors.template, function(opts, key) {
        var value = definition[key];
        if (value === undefined) {
            if (opts.required === Errors.REQUIRED) {
                throw new Error('key: ' + key + ' is required.');
            } else {
                value = opts.default;
            }
        }
        E.prototype[key] = value;
    });

    E.prototype.name = name;

    Errors[name] = E;

    return E;
};

/**
 * To determine whether it is your custom error.
 *
 * if the error is an instance of the native Error, return `false`.
 *
 * @param  {*}  error
 * @return {Boolean}
 * @method isCustomError(err)
 */
exports.isCustomError = function(err) {
    return err instanceof BaseError;
};
// alias for isCustomError
exports.isError = Errors.isCustomError;

// TODO: 校验 template 格式
exports.setTemplate = function(template) {
    var t = {};
    util.each(template, function(params, key) {
        if (util.isString(params)) {
            t[key] = {
                message: params,
                required: Errors.REQUIRED,
            };
        } else if (util.isObject(params)) {
            t[key] = params;
        } else {
            throw new Error('The value of template item should be an object or a string. Actual key=' + key + ' value=' + JSON.stringify(params));
        }
    });
    Errors.template = t;
};

/**
 * Assigns own enumerable properties of meta to the err.meta.
 *
 * If the err.meta is undefined before assigning, it will be assigned a new object,
 * and then the own enumerable properties of second parameter will be assigned to err.meta.
 * If the err.meta is not undefined, it should be a plain object.
 *
 * the properties of meta will overwrite the properties of err.meta, if they have same name.
 *
 * @side_effect  err, err.meta
 * @param  {Error}  err  the instance of Error class or Error subclass
 * @param  {Object} meta
 * @method addMeta
 */
exports.addMeta = function(err, meta) {
    if (!err.meta) err.meta = {};
    util.extend(err.meta, meta);
};
