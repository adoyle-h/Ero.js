'use strict';

if (!Error.captureStackTrace) throw new Error('Error.captureStackTrace does not exist!');

var util = require('./util');

var Errors = {
    template: null,
};
exports = module.exports = Errors;

exports.MESSAGE_CONNECTOR = ' && ';

/**
 * 对 Error 有副作用，向 Error.prototype 添加额外字段。
 *
 * @side_effect  Error.prototype
 * @method addErrorPrototypes
 */
// var addErrorPrototypes = util.defineFunc([{
//     message: 'Error',
//     schema: assert.func().required().notes('必须是 Error 构造函数')
// }, {
//     message: 'prototypes',
//     schema: assert.object().keys({
//         name: assert.string().required()
//             .notes('错误的名字'),
//         code: assert.string().required()
//             .notes('响应体中的服务器的错误码'),
//         message: assert.string().required()
//             .notes('用于服务端打印的默认 message（如果 new Error 的时候未填 message）')
//             .notes('message 必须有信息，不能为空字符串或者 null'),
//         businessMessage: assert.string().required()
//             .notes('响应体中的错误消息，内容根据业务需求书写，由产品制定')
//             .notes('无论 new Error(message) 为何，客户端看到的是 businessMessage 的内容')
//             .notes('message 必须有信息，不能为空字符串或者 null'),
//         statusCode: assert.number().default(200)
//             .notes('响应头中的状态码')
//             .notes('因为在中国返回 http 错误码可能会被运营商挟持，所以统一返回 200 状态码'),
//         log: assert.boolean().default(false)
//             .notes('是否用 logger.error 打印错误'),
//         warn: assert.boolean().default(false)
//             .notes('是否用 logger.warn 打印错误'),
//         captureErrorStack: assert.boolean().default(false)
//             .notes('是否捕捉错误堆栈'),
//     }).required()
// }], function(Error, prototypes) {
//     util.extend(Error.prototype, prototypes);
// });

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
        stackObj.cache = (stackObj.stack || '') + '\n==== Pre-Error-Stack ====\n' + error.stack;
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
    var Error = function() {
        BaseError.apply(this, arguments);
    };
    util.inherits(Error, BaseError);

    util.extend(Error.prototype, {
        name: name,
    }, util.pick(definition, [
        'code', 'message', 'statusCode', 'log', 'warn',
        'captureErrorStack', 'businessMessage',
    ]));

    Errors[name] = Error;

    return Error;
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

exports.httpHandler = function(request) {
    var response = request.response;
    var error;

    if (!Errors.isError(response)) {
        error = response;
        var payload = response.output.payload;

        // 其他服务器错误
        error = new Errors.ServerError();
        var message = payload.message || payload.error;
        if (!payload.data) {
            error.detail = message;
        } else {
            error.detail = util.sprintf('%s. with data: %j', message, payload.data);
        }
    } else {
        error = response;
    }

    if (error instanceof Errors.NormalError) {
        if (error.detail) error.detail = util.sprintf('%s.\n%s', error.message, error.detail);
        else error.detail = error.message;
    }

    var responseError = util.extend({
        message: error.constructor.prototype.businessMessage,
    }, util.pick(error, ['code', 'detail']));

    if (responseError.detail) {
        responseError.detail = util.sprintf('%s. %s', error.message, error.detail);
    } else {
        responseError.detail = error.message;
    }

    response.output.statusCode = error.statusCode;
    response.output.payload = {
        error: responseError,
    };

    Errors.print(error, {
        RID: request.$RID,
    });
};

/**
 * handler all errors for http response
 *
 * @param  {Hapi.Request} request
 * @method handler
 */
exports.handler = function(request) {
    var response = request.response;
    var error;

    if (!Errors.isError(response)) {
        error = response;
        var payload = response.output.payload;

        if (payload.validation) { // 如果是参数校验错误
            error = new Errors.ValidationError();
            error.detail = util.sprintf('%s. Validations: %j', payload.message, payload.validation);
        } else {
            // 其他服务器错误
            error = new Errors.ServerError();
            var message = payload.message || payload.error;
            if (!payload.data) {
                error.detail = message;
            } else {
                error.detail = util.sprintf('%s. with data: %j', message, payload.data);
            }
        }
    } else {
        error = response;
    }

    if (error instanceof Errors.NormalError) {
        if (error.detail) error.detail = util.sprintf('%s.\n%s', error.message, error.detail);
        else error.detail = error.message;
    }

    var responseError = util.extend({
        message: error.constructor.prototype.businessMessage,
    }, util.pick(error, ['code', 'detail']));

    if (responseError.detail) {
        responseError.detail = util.sprintf('%s. %s', error.message, error.detail);
    } else {
        responseError.detail = error.message;
    }

    response.output.statusCode = error.statusCode;
    response.output.payload = {
        error: responseError,
    };

    Errors.print(error, {
        RID: request.$RID,
    });
};

/**
 * print error log
 *
 * @side_effect  error  meta 将会赋值到 error.meta
 * @param  {Errors.<Error>} error
 * @param  {Object}         meta    额外的元数据
 * @method print
 */
exports.print = function(error, meta) {
    if (!error.meta) error.meta = {};
    util.defaults(error.meta, meta);

    if (Errors.isError(error)) {
        if (error.log) {
            var print = error.warn ? logger.warn : logger.error;
            print.call(logger, error);
        }
    } else {
        logger.error(error);
    }
};

function makeIllyriaResponseError(err) {
    var error;

    if (Errors.isError(err)) {
        error = util.extend({
            type: util.get(err, 'name', 'ERROR'),
            message: err.message,
        }, util.pick(err, [
            'code', 'detail',
        ]));
    } else {
        error = {
            type: 'ERROR',
            message: util.get(err, 'message', '[illyria server] 缺失错误信息'),
        };
    }

    return {
        error: error,
    };
}

exports.illyriaServerHandler = function(err) {
    var error = null;
    if ((err instanceof Error) === false) return error;

    Errors.print(err);
    error = makeIllyriaResponseError(err);
    return error;
};
