'use strict';

describe('#base_error', function() {
    var BaseError = require('../../src/base_error');

    function checkKeys(err) {
        err.should.have.keys(['meta', 'message', 'stack']);
    }

    it('new BaseError(message)', function() {
        var message = 'this a BaseError';
        var err = new BaseError(message);
        err.name.should.equal('BaseError');
        err.meta.should.be.an.Object();
        err.message.should.equal(message);
        err.stack.should.be.a.String()
            .and.not.containEql(/\==== Pre-Error-Stack ====/g);
        err.stack.indexOf('BaseError: ' + message).should.equal(0);
        checkKeys(err);
    });

    it('new BaseError(message, param1, param2...paramN)', function() {
        var targetMessage = 'hello! this a BaseError';
        var err = new BaseError('%s! this a %s', 'hello', 'BaseError');
        err.name.should.equal('BaseError');
        err.message.should.equal(targetMessage);
        err.stack.should.be.a.String()
            .and.not.containEql(/\==== Pre-Error-Stack ====/g);
        err.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
        checkKeys(err);
    });

    it('new BaseError(meta, message)', function() {
        var message = 'this a BaseError';
        var meta = {a: 1};
        var err = new BaseError(meta, message);
        var targetMessage = message;

        err.name.should.equal('BaseError');
        err.meta.should.equal(meta);
        err.message.should.equal(message);
        err.stack.should.be.a.String()
            .and.not.containEql(/\==== Pre-Error-Stack ====/g);
        err.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
        checkKeys(err);
    });

    it('new BaseError(error, message)', function() {
        var error = new Error();
        error.meta = {a: 1};
        var message = 'this a BaseError';
        var err = new BaseError(error, message);
        var targetMessage = message;

        err.name.should.equal('BaseError');
        err.meta.should.deepEqual(error.meta);
        err.message.should.equal(message);
        err.stack.should.be.a.String();
        err.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
        err.stack.match(/\==== Pre-Error-Stack ====/g).length.should.equal(1);
        checkKeys(err);
    });

    it('new BaseError(error, meta, message)', function() {
        var _message = 'this a native error';
        var error = new Error(_message);
        error.meta = {a: 3, b: 2};
        var message = 'this a BaseError';
        var targetMessage = message + ' && ' + _message;
        var meta = {a: 1};
        var err = new BaseError(error, meta, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({a: 1, b: 2});
        err.message.should.equal(targetMessage);
        err.stack.should.be.a.String();
        err.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
        err.stack.match(/\==== Pre-Error-Stack ====/g).length.should.equal(1);
        checkKeys(err);
    });

    it('new BaseError(meta, error, message)', function() {
        var _message = 'this a native error';
        var error = new Error(_message);
        error.meta = {a: 3, b: 2};
        var message = 'this a BaseError';
        var targetMessage = message + ' && ' + _message;
        var meta = {a: 1};
        var err = new BaseError(meta, error, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({a: 1, b: 2});
        err.message.should.equal(targetMessage);
        err.stack.should.be.a.String();
        err.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
        err.stack.match(/\==== Pre-Error-Stack ====/g).length.should.equal(1);
        checkKeys(err);
    });

    it('new BaseError(meta, error, message, param1, param2...paramN)', function() {
        var _message = 'this a native error';
        var error = new Error(_message);
        error.meta = {a: 3, b: 2};
        var message = '%s! this a %s';
        var meta = {a: 1};
        var err = new BaseError(meta, error, message, 'hello', 'BaseError');
        var targetMessage = 'hello! this a BaseError && ' + _message;

        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({a: 1, b: 2});
        err.message.should.equal(targetMessage);
        err.stack.should.be.a.String();
        err.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
        err.stack.match(/\==== Pre-Error-Stack ====/g).length.should.equal(1);
        checkKeys(err);
    });

    it('new BaseError(undefined, message) should equal new BaseError(message)', function() {
        var error;
        var message = 'this a BaseError';
        var err = new BaseError(error, message);
        var targetMessage = message;

        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({});
        err.message.should.equal(message);
        err.stack.should.be.a.String()
            .and.not.containEql(/\==== Pre-Error-Stack ====/g);
        err.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
        checkKeys(err);
    });

    it('new BaseError(null, message) should equal new BaseError(message)', function() {
        var error = null;
        var message = 'this a BaseError';
        var err = new BaseError(error, message);
        var targetMessage = message;

        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({});
        err.message.should.equal(message);
        err.stack.should.be.a.String()
            .and.not.containEql(/\==== Pre-Error-Stack ====/g);
        err.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
        checkKeys(err);
    });

    it('new BaseError(undefined, undefined, message) should equal new BaseError(message)', function() {
        var error, meta;
        var message = 'this a BaseError';
        var err = new BaseError(error, meta, message);
        var targetMessage = message;

        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({});
        err.message.should.equal(message);
        err.stack.should.be.a.String()
            .and.not.containEql(/\==== Pre-Error-Stack ====/g);
        err.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
        checkKeys(err);
    });

    it('new BaseError(0, undefined, message) should equal new BaseError(message)', function() {
        var error = 0;
        var meta;
        var message = 'this a BaseError';
        var err = new BaseError(error, meta, message);
        var targetMessage = message;

        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({});
        err.message.should.equal(message);
        err.stack.should.be.a.String()
            .and.not.containEql(/\==== Pre-Error-Stack ====/g);
        err.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
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

        it('chain three errors', function() {
            var firstErr = new Error('the first error');
            var secondMeta = {a: 1, b: 3};
            var secondErr = new BaseError(firstErr, secondMeta, 'the second error');
            var thirdMeta = {b: '2', c: [3], d: true};
            var thirdErr = new BaseError(thirdMeta, secondErr, '%s is %s', 'something', 'wrong');
            var targetMessage = 'something is wrong && the second error && the first error';

            thirdErr.message.should.equal(targetMessage);
            thirdErr.meta.should.deepEqual({a: 1, b: '2', c: [3], d: true});
            thirdErr.stack.should.be.a.String();
            thirdErr.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
            thirdErr.stack.match(/\==== Pre-Error-Stack ====/g).length.should.equal(2);
        });

        it('show pre error message if current error without any message', function() {
            var firstErr = new Error('the first error');
            var secondMeta = {a: 1, b: 3};
            var secondErr = new BaseError(firstErr, secondMeta);
            var targetMessage = 'the first error';

            secondErr.message.should.equal(targetMessage);
            secondErr.stack.should.be.a.String();
            secondErr.stack.indexOf('BaseError: ' + targetMessage).should.equal(0);
        });
    });
});
