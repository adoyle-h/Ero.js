'use strict';

/**
 * @class BaseError
 */

var util = require('./util');

/**
 * @private
 *
 * @method  getBaseErrorStackFunc
 * @param   {Object}  stackObj
 * @param   {String}  [stackObj.stack='']
 * @param   {Object}  [preError]
 * @param   {String}  [preError.stack='']
 * @return  {Function}
 */
function getBaseErrorStackFunc(stackObj, preError) {
    var cache;
    return function() {
        var baseError = this;
        if (!cache) {
            if (preError) {
                cache = util.get(stackObj, 'stack', '') +
                    baseError.ERROR_STACK_SEPARATOR +
                    util.get(preError, 'stack', '');
            } else {
                cache = util.get(stackObj, 'stack', '');
            }
        }
        return cache;
    };
}


/**
 * Assign stack property to BaseError instance.
 *
 * @private
 *
 * @side_effect baseError
 * @method  assignStack
 * @param   {BaseError}  baseError
 * @param   {Object}  stackObj
 * @param   {String}  [stackObj.stack='']
 * @param   {Object}  [preError]
 * @param   {String}  [preError.stack='']
 * @return  {undefined}
 */
function assignStack(baseError, stackObj, preError) {
    Object.defineProperty(baseError, 'stack', {
        configurable: true,
        enumerable: true,
        get: getBaseErrorStackFunc(stackObj, preError),
    });
}

/**
 * You should define your error class which inherits the `BaseError` class
 *
 * The properties of BaseError instance：
 *
 *   - meta: {Object} The metadata for error.
 *   - message: {String} The error message.
 *   - [stack]: {String} The error stack. It is existed when `captureStackTrace` is `true`.
 *   - captureStackTrace: {Boolean} Whether to capture the stack trace. Default to `true`.
 *   - name: {String} The name of error class.
 *   - ERROR_STACK_SEPARATOR: {String} The separator between multi error stacks.
 *   - MESSAGE_CONNECTOR: {String} The connector between multi error messages.
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
 * @extends  Error
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
        assignStack(self, stackObj);
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
            assignStack(self, stackObj, error);
        }
    }

    // For stack takes with error message
    // see https://github.com/nodejs/node/issues/5675#issuecomment-203966051
    stackObj.name = this.name;
    stackObj.message = message;

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
