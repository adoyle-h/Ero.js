'use strict';

/**
 * @class BaseError
 */

var util = require('./util');

/**
 * @private
 */
function getBaseErrorStack() {
    var stackObj = this;
    if (!stackObj.cache) {
        stackObj.cache = stackObj.stack;
    }
    return stackObj.cache;
}

/**
 * @private
 *
 * @method  getBaseErrorStackFunc
 * @param   {Object}  error
 * @param   {String}  error.stack
 * @param   {Object}  stackObj
 * @param   {String}  [stackObj.stack]
 * @return  {Function}
 */
function getBaseErrorStackFunc(error, stackObj) {
    var cache;
    return function() {
        if (!cache) {
            cache = (stackObj.stack || '') + this.ERROR_STACK_SEPARATOR + error.stack;
        }
        return cache;
    };
}

/**
 * You should define your error class which inherits the `BaseError` class
 *
 * The properties of BaseError instance：
 *
 *   - meta: {Object} The metadata for error.
 *   - message: {String} The error message.
 *   - [stack]: {String} The error stack. It is existed when `captureStackTrace` is `true`.
 *   - captureStackTrace: {Boolean} Whether to capture the stack trace. Default to `true`;
 *
 * The `meta` is prior to `error.meta`, when their properties have same names.
 *
 * Usages:
 *
 *     new BaseError([meta][, error])
 *     new BaseError(message[, params1, ... paramsN])
 *     new BaseError([meta][, error], message[, params1, ... paramsN])
 *     new BaseError([error][, meta][, message[, params1, ... paramsN]])
 *
 * @constructor
 * @param  {Error}  [error=null]  An instance of Error
 * @param  {Object}  [meta={}]  A metadata for error
 * @param  {String}  [message='']  A normal string or a string template with `%` placeholders
 * @param  {*...}  [paramsN]  Some parameters to replace the `%` placeholders in message.
 */
function BaseError() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var message = '';
    var meta = {};
    var stackObj = {};
    var params, error, preArgs, arg, errorMessage;

    var messageIndex = util.findIndex(args.slice(0, 3), util.isString);

    if (messageIndex !== -1) {
        params = args.slice(messageIndex + 1);
        message = util.vsprintf(args[messageIndex], params);
        preArgs = args.slice(0, messageIndex);
    } else {
        preArgs = args.slice(0, 2);
    }

    while (preArgs.length !== 0) {
        arg = preArgs.pop();
        if (arg instanceof Error) {
            error = arg;
        } else if (util.isObject(arg)) {
            meta = arg;
        }
    }

    if (self.captureStackTrace) {
        Error.captureStackTrace(stackObj, self.constructor);
        Object.defineProperty(self, 'stack', {
            configurable: true,
            enumerable: true,
            get: getBaseErrorStack.bind(stackObj),
        });
    }

    if (error) {
        meta = util.extend({}, error.meta, meta);
        errorMessage = error.message;
        if (!util.isEmpty(errorMessage)) {
            if (message) {
                message = message + this.MESSAGE_CONNECTOR + errorMessage;
            } else {
                message = errorMessage;
            }
        }

        if (error.stack) {
            Object.defineProperty(self, 'stack', {
                configurable: true,
                enumerable: true,
                get: getBaseErrorStackFunc(error, stackObj),
            });
        }
    }

    self.meta = meta;
    self.message = message;
}
util.inherits(BaseError, Error);

/**
 * The name of error class.
 * @property {String}
 */
BaseError.prototype.name = 'BaseError';

/**
 * Whether to capture the stack trace.
 * @property {Boolean}
 */
BaseError.prototype.captureStackTrace = true;

/**
 * The separator for multi error stacks.
 * @property {String}
 */
BaseError.prototype.ERROR_STACK_SEPARATOR = '\n==== Pre-Error-Stack ====\n';

/**
 * The connector for multi error messages.
 * @property {String}
 */
BaseError.prototype.MESSAGE_CONNECTOR = ' && ';

module.exports = BaseError;
