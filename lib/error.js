'use strict';

if (!Error.captureStackTrace) throw new Error('Error.captureStackTrace does not exist!');

var util = require('./util');

var Errors = {
    template: null,
    MESSAGE_CONNECTOR: ' && ',
    ERROR_STACK_SEPARATOR: '\n==== Pre-Error-Stack ====\n',
};
exports = module.exports = Errors;


function getBaseErrorStack() {
    var self = this;
    var stackObj = self._stackObj;
    if (stackObj.cache) return stackObj.cache;
    stackObj.cache = stackObj.stack;
    return stackObj.cache;
}

function getBaseErrorStackFunc(error) {
    return function() {
        var self = this;
        var stackObj = self._stackObj;
        if (stackObj.cache) return stackObj.cache;
        stackObj.cache = (stackObj.stack || '') + Errors.ERROR_STACK_SEPARATOR + error.stack;
        return stackObj.cache;
    };
}

/**
 * You should define your error class which inherits the `BaseError` class
 *
 * the properties of BaseError instance：
 *   - meta: Object. The metadata for error.
 *   - message: String. The error message.
 *   - [stack]: String. The error stack. It is existed when `captureErrorStack` is `true`.
 *   - captureErrorStack: Boolean. default to `true`;
 *
 * the `meta` is prior to `error.meta`, when their properties have same names.
 *
 * @param  {Error}  [error=null]  an instance of Error
 * @param  {Object}  [meta={}]  metadata for error
 * @param  {String}  [message=null]  a normal string or a string template with `%` placeholders
 * @param  {*}  [paramsN=null]  parameter used when message has the `%` placeholders
 *
 * @method BaseError([meta][, error])
 * @method BaseError(message[, params1, ... paramsN])
 * @method BaseError([meta][, error], message[, params1, ... paramsN])
 * @method BaseError([error][, meta][, message[, params1, ... paramsN]])
 */
function BaseError() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var message = '';
    var params;
    var meta = {};
    var error;
    var preArgs;
    var stackObj = {};

    var messageIndex = util.findIndex(args.slice(0, 3), util.isString);

    if (messageIndex !== -1) {
        params = args.slice(messageIndex + 1);
        message = util.vsprintf(args[messageIndex], params);
        preArgs = args.slice(0, messageIndex);
    } else {
        preArgs = args.slice(0, 2);
    }

    var arg;
    while (preArgs.length !== 0) {
        arg = preArgs.pop();
        if (util.isError(arg)) {
            error = arg;
        } else if (util.isObject(arg)) {
            meta = arg;
        }
    }

    if (self.captureErrorStack) {
        Error.captureStackTrace(stackObj, self.constructor);
        Object.defineProperty(self, 'stack', {
            configurable: true,
            get: getBaseErrorStack,
        });
    }

    if (error) {
        meta = util.extend({}, error.meta, meta);

        var errorMessage = error.message;
        if (!util.isEmpty(errorMessage)) {
            if (message) {
                message = message + Errors.MESSAGE_CONNECTOR + errorMessage;
            } else {
                message = errorMessage;
            }
        }

        if (error.stack) {
            Object.defineProperty(self, 'stack', {
                configurable: true,
                get: getBaseErrorStackFunc(error),
            });
        }
    }

    self.meta = meta;
    self.message = message;
    self._stackObj = stackObj;
}
util.inherits(BaseError, Error);

BaseError.prototype.name = 'BaseError';
BaseError.prototype.captureErrorStack = true;

exports.BaseError = BaseError;

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


/**
 * define a subclass of BaseError
 */
exports.defineError = function(name, definition) {
    if (!Errors.template) throw new Error('You should call setTemplate() first!');

    var E = function() {
        BaseError.apply(this, arguments);
    };
    util.inherits(E, BaseError);

    util.extend(E.prototype, {
        name: name,
    }, util.pick(definition, util.keys(Errors.template)));

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


exports.defineBaseError = function(definition) {
    // body...
};

exports.defineSubError = function(definition) {
    // body...
};

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

exports.OPTIONAL = 0;
exports.REQUIRED = 1;
