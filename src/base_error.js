'use strict';

var util = require('./util');

function getBaseErrorStack() {
    var stackObj = this;
    if (!stackObj.cache) {
        stackObj.cache = stackObj.stack;
    }
    return stackObj.cache;
}

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
            enumerable: true,
            get: getBaseErrorStack.bind(stackObj),
        });
    }

    if (error) {
        meta = util.extend({}, error.meta, meta);

        var errorMessage = error.message;
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

BaseError.prototype.name = 'BaseError';
BaseError.prototype.captureErrorStack = true;
BaseError.prototype.ERROR_STACK_SEPARATOR = '\n==== Pre-Error-Stack ====\n';
BaseError.prototype.MESSAGE_CONNECTOR = ' && ';

module.exports = BaseError;
