'use strict';

exports.errorTemplate = {
    code: 'The error code',
    captureErrorStack: {
        message: 'Whether capture error stack or not',
        required: false,
        default: true,
    },
    statusCode: {
        message: 'The status code of HTTP response',
        required: false,
        default: 500,
    },
    logLevel: {
        message: 'The level for your logging message',
        required: true,
    },
};

exports.definitions = {
    Error: {
        code: '001',
        logLevel: 'error',
    },
    RejectError: {
        code: '002',
        captureErrorStack: false,
        statusCode: 400,
        logLevel: false,
    },
    NotFoundError: {
        code: '003',
        captureErrorStack: false,
        statusCode: 404,
        logLevel: 'info',
    },
};
