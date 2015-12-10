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

        it('without template and definitions', function() {
            Errors.init({
                lazy: true,
            });
        });

        it('should throw error when init() without any params', function() {
            should.throws(function() {
                Errors.init();
            }, 'template should be an Object!');
        });
    });

    describe('setTemplate()', function() {
        beforeEach(function() {
            Errors.init({
                lazy: true,
            });
        });

        it('', function() {
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
        it('should do what...', function() {
            Errors.defineError;
        });
    });
});
