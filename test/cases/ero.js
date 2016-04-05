'use strict';

describe('#Ero', function() {
    var should = require('should');
    var util = require('../../src/util');
    var Ero = require('../../src/ero');
    var BaseError = require('../../src/base_error');
    var Fakers = require('../fixtures/fakers');

    function checkEroTemplate(ero) {
        ero.template.should.deepEqual({
            code: {
                message: 'The error code',
                required: true,
            },
            captureStackTrace: {
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
        });
    }

    function checkEroBaseError(ero) {
        ero.BaseError.should.be.a.Function();
        ero.BaseError.should.not.equal(BaseError);
        ero.BaseError.super_.should.equal(Error);
    }

    describe('setTemplate()', function() {
        var ero;

        beforeEach(function() {
            ero = {template: null};
        });

        it('should throw error when template is not an object', function() {
            should.throws(function() {
                Ero.prototype.setTemplate.call(ero);
            }, function(err) {
                err.message.should.equal('template should be an object!');
                return true;
            });
        });

        it('check Errors.template', function() {
            Ero.prototype.setTemplate.call(ero, Fakers.errorTemplate);
            checkEroTemplate(ero);
        });
    });

    describe('defineErrorClass()', function() {
        var ero;

        beforeEach(function() {
            ero = {
                template: null,
                Errors: {BaseError: BaseError},
                BaseError: BaseError,
            };
        });

        it('should throw error when defineError() before setting template', function() {
            should.throws(function() {
                Ero.prototype.defineErrorClass.call(ero, {
                    code: '001',
                    captureStackTrace: true,
                }, 'Error');
            }, function(err) {
                err.message.should.equal('The error template should be defined firstly!');
                return true;
            });
        });

        it('should throw error when definition is not an object', function() {
            Ero.prototype.setTemplate.call(ero, Fakers.errorTemplate);

            should.throws(function() {
                Ero.prototype.defineErrorClass.call(ero, null, 'Error');
            }, function(err) {
                err.message.should.equal('Definition should be an object! Current error name=Error');
                return true;
            });
        });

        it('should throw error when definition missing a required key', function() {
            Ero.prototype.setTemplate.call(ero, Fakers.errorTemplate);

            should.throws(function() {
                Ero.prototype.defineErrorClass.call(ero, {}, 'Error');
            }, function(err) {
                err.message.should.equal('Missing the key "code", which is required. Current error name=Error');
                return true;
            });
        });

        it('define Errors.Error and create an instance of it', function() {
            Ero.prototype.setTemplate.call(ero, Fakers.errorTemplate);
            var Errors = ero.Errors;

            var E = Ero.prototype.defineErrorClass.call(ero, {
                code: '001',
                logLevel: 'error',
            }, 'Error');

            E.should.be.a.Function();
            E.should.equal(Errors.Error);

            Errors.should.have.keys(['BaseError', 'Error']);

            var e = new E('test');
            e.should.be.an.Error();
            e.name.should.equal('Error');
            e.code.should.equal('001');
            e.captureStackTrace.should.equal(true);
            e.statusCode.should.equal(500);
            e.message.should.equal('test');
            e.stack.should.be.a.String();
        });
    });

    describe('new Ero()', function() {
        var ero;

        it('create Ero with template and definitions', function() {
            ero = new Ero({
                template: Fakers.errorTemplate,
                definitions: Fakers.definitions,
            });

            ero.Errors.should.be.an.Object()
                .and.have.properties(util.keys(Fakers.definitions));

            util.each(ero.Errors, function(_Error) {
                _Error.should.be.a.Function();
            });

            checkEroTemplate(ero);
            checkEroBaseError(ero);
        });

        it('should throw error when create Ero without any params', function() {
            should.throws(function() {
                ero = new Ero();
            }, function(err) {
                err.message.should.equal('Cannot read property \'template\' of undefined');
                return true;
            });
        });

        it('should throw error when create Ero without template', function() {
            should.throws(function() {
                ero = new Ero({
                    definitions: Fakers.definitions,
                });
            }, function(err) {
                err.message.should.equal('template should be an object!');
                return true;
            });
        });

        it('should be ok when create Ero without definitions', function() {
            ero = new Ero({
                template: Fakers.errorTemplate,
            });

            ero.Errors.should.be.an.Object().and.have.keys(['BaseError']);

            util.each(ero.Errors, function(_Error) {
                _Error.should.be.a.Function();
            });

            checkEroTemplate(ero);
            checkEroBaseError(ero);
        });
    });
});


describe('#Ero - util', function () {
    var Ero = require('../../src/ero');
    var Fakers = require('../fixtures/fakers');

    var ero;
    beforeEach(function() {
        ero = new Ero({
            template: Fakers.errorTemplate,
            definitions: Fakers.definitions,
        });
    });

    describe('setErrorStackSeparator()', function() {
        it('should not contain error message connector', function() {
            var e2 = new ero.Errors.Error();
            e2.stack.should.not.containEql('\n==== Pre-Error-Stack ====\n');
        });

        it('check default error stack separator', function() {
            var e1 = new Error();
            var e2 = new ero.Errors.Error(e1);

            e2.stack.should.containEql('\n==== Pre-Error-Stack ====\nError');
        });

        it('change error stack separator', function() {
            var separator = '\n==== !!! ====\n';
            ero.setErrorStackSeparator(separator);

            var e1 = new Error();
            var e2 = new ero.Errors.Error(e1);

            e2.stack.should.containEql(separator + 'Error');
        });
    });

    describe('setMessageConnector()', function() {
        it('should not contain error message connector', function() {
            var e2 = new ero.Errors.Error('world');

            e2.message.should.equal('world');
        });

        it('check default error message connector', function() {
            var e1 = new Error('hello');
            var e2 = new ero.Errors.Error(e1, 'world');

            e2.message.should.equal('world && hello');
        });

        it('change error message connector', function() {
            ero.setMessageConnector('||');

            var e1 = new Error('hello');
            var e2 = new ero.Errors.Error(e1, 'world');

            e2.message.should.equal('world||hello');
        });
    });

    describe('isCustomError()', function() {
        it('Errors.isCustomError(new Errors.Error()).should.be.true', function() {
            var e = new ero.Errors.Error();
            ero.isCustomError(e).should.be.true();
        });

        it('Errors.isCustomError(new Error()).should.be.false', function() {
            var e = new Error();
            ero.isCustomError(e).should.be.false();
        });
    });

    describe('addMeta()', function() {
        it('add meta to native error', function() {
            var e = new Error();
            var meta = {a: 1};
            ero.addMeta(e, meta);

            e.meta.should.deepEqual(meta);
        });

        it('add meta to custom error', function() {
            var e = new ero.Errors.Error();
            var meta = {a: 1};
            ero.addMeta(e, meta);

            e.meta.should.deepEqual(meta);
        });
    });

    describe('getErrorClass()', function() {
        it('get a error class', function() {
            var E = ero.getErrorClass('Error');
            E.should.be.a.Function();
            E.should.equal(ero.Errors.Error);
        });
    });
});
