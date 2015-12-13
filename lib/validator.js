'use strict';

var v = require('joi');
var util = require('lodash');

v.addValidators = function(validators) {
    util.each(validators, v.addValidator);
};

v.addValidator = function(validator, key) {
    if (v[key] !== undefined) {
        throw new Error('[Validator] key: ' + key + '" has existed.');
    }
    v[key] = util.constant(validator);
};

v.addValidators({
    templateProp: v.object({
        message: v.string().required()
            .description('describe the meaning of key'),
        required: v.boolean().default(true),
        default: v.any().optional().when('required', {
            is: true,
            then: v.required(),
        }).description('the default value for error instance when `definition.required` is `OPTIONAL`'),
    }),
});

exports.check = function(value, schema) {
    var rst = v.validate(value, schema, {
        allowUnknown: true,
    });
    if (rst.error) {
        var message = 'wrong parameters of function\nInput Value: ' + rst.error.annotate();
        throw new Error(message);
    }
    return rst.value;
};

exports.v = v;
