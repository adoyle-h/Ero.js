'use strict';

if (!Error.captureStackTrace) throw new Error('Error.captureStackTrace does not exist!');

var util = require('./util');
var BaseError = require('./base_error');
var v = require('./validator').v;
var check = require('./validator').check;

/**
 * This is a module which exports some APIs, the BaseError class, and your defined Error classes.
 *
 * @class Errors
 * @singleton
 */
var Errors = {
    /**
     * The parsed error template.
     * @property {Object}
     */
    template: null,
    /**
     * The BaseError class
     * @property {BaseError}
     */
    BaseError: BaseError,
};
exports = module.exports = Errors;

/**
 * Set the separator for multi error stacks.
 *
 * Default to "\n==== Pre-Error-Stack ====\n"
 *
 * @method setErrorStackSeparator
 * @param  {String} separator
 * @return {undefined}
 */
exports.setErrorStackSeparator = function(separator) {
    BaseError.prototype.ERROR_STACK_SEPARATOR = separator;
};

/**
 * Set the connector for multi error messages. Default to " && "
 *
 * @method setMessageConnector
 * @param  {String} connector
 * @return {undefined}
 */
exports.setMessageConnector = function(connector) {
    BaseError.prototype.MESSAGE_CONNECTOR = connector;
};

/**
 * Define a subclass of BaseError
 *
 * @method defineError
 * @param  {Object} definition
 * @param  {String} name  the name of Error Class
 * @return {Function}  Error Class
 */
exports.defineError = function(definition, name) {
    if (!Errors.template) throw new Error('The error template should be defined firstly!');
    if (util.isObject(definition) === false) throw new Error('definition should be an object! Current error name=' + name);

    var E = function() {
        BaseError.apply(this, arguments);
    };
    util.inherits(E, BaseError);

    util.each(Errors.template, function(opts, key) {
        var value = definition[key];
        if (value !== undefined) {
            E.prototype[key] = value;
        } else {
            if (opts.required === true) {
                throw new Error('Missing the key "' + key + '", which is required. Current error name=' + name);
            } else {
                E.prototype[key] = opts.default;
            }
        }
    });

    E.prototype.name = name;

    Errors[name] = E;

    return E;
};

/**
 * To determine whether it is your custom error.
 *
 * If the error is an instance of the native Error, return `false`.
 *
 * @method isCustomError
 * @param  {*}  error
 * @return {Boolean}
 */
exports.isCustomError = function(err) {
    return err instanceof BaseError;
};
/**
 * @alias #isCustomError
 * @method isError
 */
exports.isError = Errors.isCustomError;

/**
 * @method setTemplate
 * @param  {Object} template
 * @return {undefined}
 */
exports.setTemplate = function(template) {
    if (util.isObject(template) === false) {
        throw new Error('template should be an object!');
    }

    var t = {};
    util.each(template, function(params, key) {
        if (util.isString(params)) {
            t[key] = {
                message: params,
                required: true,
            };
        } else if (util.isObject(params)) {
            t[key] = check(params, v.templateProp());
        } else {
            throw new Error('The value of template item should be an object or a string. Actual key=' + key + ' and value=' + JSON.stringify(params));
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
 * The properties of meta will overwrite the properties of err.meta, if they have same name.
 *
 * @side_effect  err, err.meta
 * @method addMeta
 * @param  {Error}  err  the instance of Error class or Error subclass
 * @param  {Object} meta
 * @return {undefined}
 */
exports.addMeta = function(err, meta) {
    if (!err.meta) err.meta = {};
    util.extend(err.meta, meta);
};

/**
 * Initialize module. Set your error template and error definitions.
 *
 * @method init
 * @param  {Object} params
 * @param  {Object} params.template  a template for all error sub-classes
 * @param  {Object[]} params.definitions the definitions of error sub-classes
 * @return {Object}  a map of Error classes
 */
exports.init = function(params) {
    Errors.setTemplate(params.template);
    var _Errors = {};
    util.each(params.definitions, function(definition, name) {
        var E = Errors.defineError(definition, name);
        _Errors[name] = E;
    });

    return _Errors;
};
