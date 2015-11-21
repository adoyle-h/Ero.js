'use strict';

var Errors = require('../../lib/error');
var util = require('../../lib/util');
var config = require('../config');

exports.errorTemplates = [{ // normal
    code: '',
    status: '',
    captureErrorStack: '是否捕捉错误堆栈',
}, {  // my style
    name: '错误的名字',
    code: '响应体中的服务器的错误码',
    message: '用于服务端打印的默认 message（如果 new Error 的时候未填 message）',
    businessMessage: '用于客户端显示的错误消息，内容根据业务需求书写，由产品制定',
    statusCode: 'HTTP 响应头中的状态码',
    log: '是否用 logger.error 打印错误',
    warn: '是否用 logger.warn 打印错误',
    captureErrorStack: '是否捕捉错误堆栈',
}, {  // base on the appendix of https://www.joyent.com/developers/node/design/errors
    localHostname: 'the local DNS hostname (e.g., that you\'re accepting connections at)',
    localIp: 'the local IP address (e.g., that you\'re accepting connections at)',
    localPort: 'the local TCP port (e.g., that you\'re accepting connections at)',
    remoteHostname: 'the DNS hostname of some other service (e.g., that you tried to connect to)',
    remoteIp: 'the IP address of some other service (e.g., that you tried to connect to)',
    remotePort: 'the port of some other service (e.g., that you tried to connect to)',
    path: 'the name of a file, directory, or Unix Domain Socket (e.g., that you tried to open)',
    srcpath: 'the name of a path used as a source (e.g., for a rename or copy)',
    dstpath: 'the name of a path used as a destination (e.g., for a rename or copy)',
    hostname: 'a DNS hostname (e.g., that you tried to resolve)',
    ip: 'an IP address (e.g., that you tried to reverse-resolve)',
    propertyName: 'an object property name, or an argument name (e.g., for a validation error)',
    propertyValue: 'an object property value (e.g., for a validation error)',
    syscall: 'the name of a system call that failed',
    errno: 'the symbolic value of errno (e.g., "ENOENT"). Do not use this for errors that don\'t actually set the C value of errno.Use "name" to distinguish between types of errors.',
}];

/**
 * 在这自定义错误类型
 *
 * 具体参数见 addErrorPrototypes 的 schema
 *
 * **若没有跟产品确认过 businessMessage，不要新增错误类型**
 */
exports.definitions = {
    /**
     * 当其他类型的 Error 不符合你的需求，且需要在服务端打印错误信息和堆栈，请使用这个 Error
     * 用于代替 node 原生的 Error
     */
    Error: {
        name: 'Error',
        code: 'G000',
        message: '服务器发生了可预判的错误',
        businessMessage: '服务器发了会呆',
        log: true,
        captureErrorStack: true,
    },
    // 开发者请勿使用这个错误，这是底层处理用的
    ServerError: {
        code: 'G001',
        message: '服务器发生了未知错误（建议检查是否缺少执行回调函数）',
        businessMessage: '服务器发了会呆',
        log: true,
    },
    // 当需要人为地故意抛出一个错误，只返回给客户端，不需要在服务端记录错误时
    // 使用 NormalError
    NormalError: {
        code: 'G100',
        message: '请求拒绝，业务逻辑错误',
        businessMessage: '服务器发了会呆',
    },
    NotFoundError: {
        code: 'G102',
        message: 'URL 未找到',
        businessMessage: '媒人走丢了会儿',
        statusCode: 404,
    },
};
