exports.errorTemplate = {
    code: 'The error code',
    captureStackTrace: {
        message: 'Whether capture error stack or not',
        required: false,
        default: true,
    },
    message: {
        message: 'The default error message',
        required: false,
        default: 'The is a default message',
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
        captureStackTrace: false,
        statusCode: 400,
        logLevel: false,
    },
    NotFoundError: {
        code: '003',
        captureStackTrace: false,
        message: 'Not Found',
        statusCode: 404,
        logLevel: 'info',
    },
};
