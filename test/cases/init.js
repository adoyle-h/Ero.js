'use strict';

describe('#Errors', function () {
    var should = require('should');
    var async = require('async');
    var util = require('../../lib/util');
    var Errors = require('../../lib/error');
    var Fakers = require('../fixtures/fakers');
    var errorTemplates = Fakers.errorTemplates;
    var keeper;

    before(function() {
        var keys = util.keys(Fakers.definitions);
        util.each(keys, function(key) {
            delete Errors[key];
        });
        Errors.template = null;
    });

    describe('init()', function () {
        it('with template and definitions', function() {
            Errors.init({
                template: Fakers.errorTemplates,
                definitions: Fakers.definitions,
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
        
    });

    describe('defineError()', function() {
        it('should do what...', function() {
            Errors.defineError
        });
    });
});