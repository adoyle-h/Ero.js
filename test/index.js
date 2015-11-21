'use strict';

describe('#test error', function() {
    var should = require('should');
    var async = require('async');
    var util = require('../lib/util');
    var Errors = require('../lib/error');
    var Fakers = require('./fixtures/fakers');
    var errorTemplates = Fakers.errorTemplates;
    var keeper;

    before(function() {
        util.each(Fakers.definitions, Errors.defineError);
    });

    it('new BaseError(message)', function() {
        var message = 'this a BaseError';
        var err = new Errors.BaseError(message);
        err.name.should.equal('BaseError');
        err.meta.should.be.an.Object();
        err.message.should.equal(message);
        err.stack.should.be.a.String();
    });

    it('new BaseError(message, param1, param2...paramN)', function() {
        var err = new Errors.BaseError('%s! this a %s', 'hello', 'BaseError');
        err.name.should.equal('BaseError');
        err.message.should.equal('hello! this a BaseError');
        err.stack.should.be.a.String();
    });

    it('new BaseError(meta, message)', function() {
        var message = 'this a BaseError';
        var meta = {a: 1};
        var err = new Errors.BaseError(meta, message);
        err.name.should.equal('BaseError');
        err.meta.should.equal(meta);
        err.message.should.equal(message);
        err.stack.should.be.a.String();
    });

    it('new BaseError(error, message)', function() {
        var error = new Error();
        error.meta = {a: 1};
        var message = 'this a BaseError';
        var err = new Errors.BaseError(error, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual(error.meta);
        err.message.should.equal(message);
        err.stack.should.be.a.String();
    });

    it('new BaseError(error, meta, message)', function() {
        var _message = 'this a native error';
        var error = new Error(_message);
        error.meta = {a: 3, b: 2};
        var message = 'this a BaseError';
        var meta = {a: 1};
        var err = new Errors.BaseError(error, meta, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({a: 1, b: 2});
        err.message.should.equal(message + ' && ' + _message);
        err.stack.should.be.a.String();
    });

    it('new BaseError(meta, error, message)', function() {
        var _message = 'this a native error';
        var error = new Error(_message);
        error.meta = {a: 3, b: 2};
        var message = 'this a BaseError';
        var meta = {a: 1};
        var err = new Errors.BaseError(meta, error, message);
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({a: 1, b: 2});
        err.message.should.equal(message + ' && ' + _message);
        err.stack.should.be.a.String();
    });

    it('new BaseError(meta, error, message, param1, param2...paramN)', function() {
        var _message = 'this a native error';
        var error = new Error(_message);
        error.meta = {a: 3, b: 2};
        var message = 'this a BaseError';
        var meta = {a: 1};
        var err = new Errors.BaseError(meta, error, '%s! this a %s', 'hello', 'BaseError');
        err.name.should.equal('BaseError');
        err.meta.should.deepEqual({a: 1, b: 2});
        err.message.should.equal('hello! this a BaseError && ' + _message);
        err.stack.should.be.a.String();
    });


    // it('should be an instance of Error, which have stack and message', function() {
    //     var err = new Errors.Error();
    //     should.exsit(err);
    //     err.message.should.be.a.String();
    //     err.stack.should.be.an.Object();
    // });
});
