'use strict';


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
