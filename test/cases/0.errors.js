'use strict';

describe('#Errors', function() {
    var should = require('should');
    var Errors = require('../../lib/error');
    var Fakers = require('../fixtures/fakers');
    var Helper = require('../fixtures/helper');

    beforeEach(function() {
        Helper.reset(Errors);
    });

    describe('init()', function() {
        it('with template and definitions', function() {
            Errors.init({
                template: Fakers.errorTemplates[0],
                definitions: Fakers.normalDefinitions,
            });
        });

        it('should throw error when init() without any params', function() {
            should.throws(function() {
                Errors.init();
            }, 'template should be an Object!');
        });
    });

    describe('setTemplate()', function() {
        it('check Errors.template', function() {
            Errors.setTemplate(Fakers.errorTemplates[0]);
            Errors.template.should.deepEqual({
                code: {
                    message: '错误码',
                    required: true,
                },
                captureErrorStack: {
                    message: '是否捕捉错误堆栈',
                    required: true,
                },
            });
        });
    });

    describe('defineError()', function() {
        it('should throw error when defineError() before setting template', function() {
            should.throws(function() {
                Errors.defineError({
                    code: '001',
                    captureErrorStack: true,
                }, 'Error');
            }, 'The error template should be defined firstly!');
        });

        it('define Errors.Error and create an instance of it', function() {
            Errors.setTemplate(Fakers.errorTemplates[0]);

            var E = Errors.defineError({
                code: '001',
                captureErrorStack: true,
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
