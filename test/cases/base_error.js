'use strict';

describe('#base_error', function() {
    var Errors = require('../../lib/error');
    var BaseError = require('../../lib/base_error');
    var Fakers = require('../fixtures/fakers');
    var Helper = require('../fixtures/helper');

    before(function() {
        Helper.reset(Errors);
    });

    before(function() {
        Errors.init({
            template: Fakers.errorTemplate,
            definitions: Fakers.definitions,
        });
    });

    function checkKeys(err) {
        err.should.have.keys(['meta', 'message', 'stack']);
    }

    it('new BaseError(message)', function() {
        var message = 'this a BaseError';
        var err = new BaseError(message);
        err.name.should.equal('BaseError');
        err.meta.should.be.an.Object();
        err.message.should.equal(message);
        err.stack.should.be.a.String();
        checkKeys(err);
    });

    it('new BaseError(message, param1, param2...paramN)', function() {
        var err = new BaseError('%s! this a %s', 'hello', 'BaseError');
        err.name.should.equal('BaseError');
        err.message.should.equal('hello! this a BaseError');
        err.stack.should.be.a.String();
        checkKeys(err);
    });

    it('new BaseError(meta, message)', function() {
        var message = 'this a BaseError';
        var meta = {a: 1};
        var err = new BaseError(meta, message);
        err.name.should.equal('BaseError');
        err.meta.should.equal(meta);
        err.message.should.equal(message);
        err.stack.should.be.a.String();
        checkKeys(err);
    });

    it('new BaseError(error, message)', function() {
        var error = new Error();
        error.meta = {a: 1};
        var message = 'this a BaseError';
        var err = new BaseError(error, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual(error.meta);
        err.message.should.equal(message);
        err.stack.should.be.a.String();
        checkKeys(err);
    });

    it('new BaseError(error, meta, message)', function() {
        var _message = 'this a native error';
        var error = new Error(_message);
        error.meta = {a: 3, b: 2};
        var message = 'this a BaseError';
        var meta = {a: 1};
        var err = new BaseError(error, meta, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({a: 1, b: 2});
        err.message.should.equal(message + ' && ' + _message);
        err.stack.should.be.a.String();
        checkKeys(err);
    });

    it('new BaseError(meta, error, message)', function() {
        var _message = 'this a native error';
        var error = new Error(_message);
        error.meta = {a: 3, b: 2};
        var message = 'this a BaseError';
        var meta = {a: 1};
        var err = new BaseError(meta, error, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({a: 1, b: 2});
        err.message.should.equal(message + ' && ' + _message);
        err.stack.should.be.a.String();
        checkKeys(err);
    });

    it('new BaseError(meta, error, message, param1, param2...paramN)', function() {
        var _message = 'this a native error';
        var error = new Error(_message);
        error.meta = {a: 3, b: 2};
        var message = '%s! this a %s';
        var meta = {a: 1};
        var err = new BaseError(meta, error, message, 'hello', 'BaseError');
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({a: 1, b: 2});
        err.message.should.equal('hello! this a BaseError && ' + _message);
        err.stack.should.be.a.String();
        checkKeys(err);
    });

    it('new BaseError(undefined, message) should equal new BaseError(message)', function() {
        var error;
        var message = 'this a BaseError';
        var err = new BaseError(error, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({});
        err.message.should.equal(message);
        err.stack.should.be.a.String();
        checkKeys(err);
    });

    it('new BaseError(null, message) should equal new BaseError(message)', function() {
        var error = null;
        var message = 'this a BaseError';
        var err = new BaseError(error, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({});
        err.message.should.equal(message);
        err.stack.should.be.a.String();
        checkKeys(err);
    });

    it('new BaseError(undefined, undefined, message) should equal new BaseError(message)', function() {
        var error;
        var meta;
        var message = 'this a BaseError';
        var err = new BaseError(error, meta, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({});
        err.message.should.equal(message);
        err.stack.should.be.a.String();
        checkKeys(err);
    });

    it('new BaseError(0, undefined, message) should equal new BaseError(message)', function() {
        var error = 0;
        var meta;
        var message = 'this a BaseError';
        var err = new BaseError(error, meta, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({});
        err.message.should.equal(message);
        err.stack.should.be.a.String();
        checkKeys(err);
    });

    describe('## test message', function() {
        it('no message', function() {
            var err = new BaseError();
            err.message.should.be.empty();
            checkKeys(err);
        });

        it('only previous error message', function() {
            var message = 'hello';
            var e1 = new Error(message);
            var err = new BaseError(e1);
            err.message.should.be.equal(message);
            checkKeys(err);
        });

        it('connect previous error message with " && "', function() {
            var message = 'hello';
            var e1 = new Error(message);
            var message2 = 'world';
            var err = new BaseError(e1, message2);
            err.message.should.be.equal(message2 + ' && ' + message);
            checkKeys(err);
        });

        it('connect previous error message with " && " while using string format', function() {
            var message = 'hello';
            var e1 = new Error(message);
            var err = new BaseError(e1, 'this is %s', 'world');
            err.message.should.be.equal('this is world && ' + message);
            checkKeys(err);
        });
    });
});
