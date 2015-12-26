'use strict';

describe('#Errors - basic', function() {
    var should = require('should');
    var util = require('../../src/util');
    var Errors = require('../../src/error');
    var Fakers = require('../fixtures/fakers');
    var Helper = require('../fixtures/helper');

    describe('init()', function() {
        afterEach(function() {
            Helper.reset(Errors);
        });

        it('with template and definitions', function() {
            Errors.init({
                template: Fakers.errorTemplate,
                definitions: Fakers.definitions,
            });
        });

        it('should return a map of custom Errors', function() {
            var _Errors = Errors.init({
                template: Fakers.errorTemplate,
                definitions: Fakers.definitions,
            });

            _Errors.should.have.keys(util.keys(Fakers.definitions));

            util.each(_Errors, function(_Error) {
                _Error.should.be.a.Function();
            });
        });

        it('should throw error when init() without any params', function() {
            should.throws(function() {
                Errors.init();
            }, function(err) {
                err.message.should.equal('Cannot read property \'template\' of undefined');
                return true;
            });
        });
    });

    describe('setTemplate()', function() {
        afterEach(function() {
            Helper.reset(Errors);
        });

        it('should throw error when template is not an object', function() {
            should.throws(function() {
                Errors.setTemplate();
            }, function(err) {
                err.message.should.equal('template should be an object!');
                return true;
            });
        });

        it('check Errors.template', function() {
            Errors.setTemplate(Fakers.errorTemplate);
            Errors.template.should.deepEqual({
                code: {
                    message: 'The error code',
                    required: true,
                },
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
            });
        });
    });

    describe('defineError()', function() {
        afterEach(function() {
            Helper.reset(Errors);
        });

        it('should throw error when defineError() before setting template', function() {
            should.throws(function() {
                Errors.defineError({
                    code: '001',
                    captureErrorStack: true,
                }, 'Error');
            }, function(err) {
                err.message.should.equal('The error template should be defined firstly!');
                return true;
            });
        });

        it('should throw error when definition is not an object', function() {
            Errors.setTemplate(Fakers.errorTemplate);

            should.throws(function() {
                Errors.defineError(null, 'Error');
            }, function(err) {
                err.message.should.equal('definition should be an object! Current error name=Error');
                return true;
            });
        });

        it('should throw error when definition missing a required key', function() {
            Errors.setTemplate(Fakers.errorTemplate);

            should.throws(function() {
                Errors.defineError({}, 'Error');
            }, function(err) {
                err.message.should.equal('Missing the key "code", which is required. Current error name=Error');
                return true;
            });
        });

        it('define Errors.Error and create an instance of it', function() {
            Errors.setTemplate(Fakers.errorTemplate);

            var E = Errors.defineError({
                code: '001',
                captureErrorStack: true,
                logLevel: 'error',
            }, 'Error');

            E.should.equal(Errors.Error);

            Errors.Error.should.be.a.Function();

            var e = new E('test');
            e.should.be.an.Error();
            e.code.should.equal('001');
            e.captureErrorStack.should.equal(true);
            e.message.should.equal('test');
            e.stack.should.be.a.String();
        });
    });
});

describe('#Errors', function() {
    var Errors = require('../../src/error');
    var Fakers = require('../fixtures/fakers');

    before(function() {
        Errors.init({
            template: Fakers.errorTemplate,
            definitions: Fakers.definitions,
        });
    });

    describe('isCustomError()', function() {
        it('Errors.isCustomError(new Errors.Error()).should.be.true', function() {
            var e = new Errors.Error();
            Errors.isCustomError(e).should.be.true();
        });

        it('Errors.isCustomError(new Error()).should.be.false', function() {
            var e = new Error();
            Errors.isCustomError(e).should.be.false();
        });
    });

    describe('addMeta()', function() {
        it('add meta to native error', function() {
            var e = new Error();
            var meta = {a: 1};
            Errors.addMeta(e, meta);

            e.meta.should.deepEqual(meta);
        });

        it('add meta to custom error', function() {
            var e = new Errors.Error();
            var meta = {a: 1};
            Errors.addMeta(e, meta);

            e.meta.should.deepEqual(meta);
        });
    });

    describe('setErrorStackSeparator()', function() {
        afterEach(function() {
            Errors.setErrorStackSeparator('\n==== Pre-Error-Stack ====\n');
        });

        it('change error stack separator', function() {
            var separator = '\n==== !!! ====\n';
            Errors.setErrorStackSeparator(separator);

            var e1 = new Error();
            var e2 = new Errors.Error(e1);

            e2.stack.should.containEql(separator + 'Error');
        });
    });

    describe('setMessageConnector()', function() {
        afterEach(function() {
            Errors.setMessageConnector(' && ');
        });

        it('change error message connector', function() {
            Errors.setMessageConnector('||');

            var e1 = new Error('hello');
            var e2 = new Errors.Error(e1, 'world');

            e2.message.should.equal('world||hello');
        });
    });
});
