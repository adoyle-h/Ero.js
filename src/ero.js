if (!Error.captureStackTrace) throw new Error('Error.captureStackTrace does not exist!');

var util = require('./util');
var v = require('./validator').v;
var check = require('./validator').check;

/**
 * @private
 * @param {BaseError} origin
 * @return {BaseError}  cloned BaseError
 */
function cloneBaseError(origin) {
    // eslint-disable-next-line no-shadow
    function BaseError() {
        origin.apply(this, arguments);
    }

    util.inherits(BaseError, Error);
    util.extend(BaseError.prototype, origin.prototype);
    return BaseError;
}

/**
 * Ero is an error space, which maintains your error template, error definitions.
 * It also exports Error classes and some functions for developing.
 *
 * @class Ero
 * @constructor
 *
 * @param  {Object}  params
 * @param  {Object}  params.specifications  A template for all error sub-classes
 * @param  {Object[]}  [params.definitions]  The definitions of error sub-classes
 */
function Ero(params) {
    var ero = this;
    /**
     * The parsed error specifications.
     * @property {Object}
     */
    ero.specifications = null;
    Object.defineProperty(ero, 'template', {
        get: function() {
            // eslint-disable-next-line no-console
            console.warn('The ero.template is deprecated. Use ero.specifications instead.');
            return ero.specifications;
        },
    });
    /**
     * The BaseError class.
     * @property {BaseError}
     */
    ero.BaseError = cloneBaseError(require('./base_error'));
    /**
     * All error classes are exported here. Including BaseError.
     * @property {Errors}
     */
    ero.Errors = {BaseError: ero.BaseError};

    if (params.template) {
        ero.setTemplate(params.template);
    } else {
        ero.setTemplate(params.specifications);
    }

    util.each(params.definitions, function(definition, name) {
        ero.defineErrorClass(definition, name);
    });
}

/**
 * Set the separator for multi error stacks.
 *
 * Default to "\n==== Pre-Error-Stack ====\n"
 *
 * @method setErrorStackSeparator
 * @param  {String} separator
 * @return {undefined}
 */
Ero.prototype.setErrorStackSeparator = function(separator) {
    this.BaseError.prototype.ERROR_STACK_SEPARATOR = separator;
};

/**
 * Set the connector for multi error messages. Default to " && "
 *
 * @method setMessageConnector
 * @param  {String} connector
 * @return {undefined}
 */
Ero.prototype.setMessageConnector = function(connector) {
    this.BaseError.prototype.MESSAGE_CONNECTOR = connector;
};


/**
 * Define a subclass of BaseError
 *
 * @method defineErrorClass
 * @param  {Object} definition
 * @param  {String} name  The name of error class
 * @return {Function}  Error class
 */
Ero.prototype.defineErrorClass = function(definition, name) {
    var ero = this;
    if (!ero.template) {
        throw new Error('The error template should be defined firstly!');
    }
    if (util.isObject(definition) === false) {
        throw new Error('Definition should be an object! Current error name=' + name);
    }
    if (ero.Errors[name]) {
        // eslint-disable-next-line max-len
        throw new Error('The name of error class has been defined in the ero! Current error name=' + name);
    }

    function E() {
        ero.BaseError.apply(this, arguments);
    }
    util.inherits(E, ero.BaseError);

    util.each(ero.template, function(opts, key) {
        var value = definition[key];
        if (value !== undefined) {
            E.prototype[key] = value;
        } else {
            if (opts.required === true) {
                // eslint-disable-next-line max-len
                throw new Error('Missing the key "' + key + '", which is required. Current error name=' + name);
            } else {
                E.prototype[key] = opts.default;
            }
        }
    });

    E.prototype.name = name;

    ero.Errors[name] = E;

    return E;
};

/**
 * @alias #defineErrorClass
 * @method defineError
 */
Ero.prototype.defineError = Ero.prototype.defineErrorClass;

/**
 * @method setTemplate
 * @param  {Object} specifications
 * @return {undefined}
 */
Ero.prototype.setSpecifications = function(specifications) {
    var ero = this;
    if (util.isObject(specifications) === false) {
        throw new Error('template should be an object!');
    }

    var t = {};
    util.each(specifications, function(params, key) {
        if (util.isString(params)) {
            t[key] = {
                message: params,
                required: true,
            };
        } else if (util.isObject(params)) {
            t[key] = check(params, v.templateProp());
        } else {
            // eslint-disable-next-line max-len
            throw new Error('The spec "' + key + '" should be an object or a string. Actual value=' + JSON.stringify(params));
        }
    });
    ero.specifications = t;
};
Ero.prototype.setTemplate = util.deprecate(Ero.prototype.setSpecifications, '');

/**
 * get error class
 *
 * @method  getErrorClass
 * @param   {String}  name  The name of error class
 * @return  {Function}  The error class
 */
Ero.prototype.getErrorClass = function(name) {
    return this.Errors[name];
};

/**
 * @alias #getErrorClass
 * @method getError
 */
Ero.prototype.getError = Ero.prototype.getErrorClass;

/**
 * To determine whether it is your custom error.
 *
 * If the error is an instance of the native Error, return `false`.
 *
 * @method isInstanceOfBaseError
 * @param  {*}  err
 * @return {Boolean}
 * @static
 */
function isInstanceOfBaseError(err) {
    return err instanceof this.BaseError;
}
util.staticMethod(Ero, 'isInstanceOfBaseError', isInstanceOfBaseError);

/**
 * @alias #isInstanceOfBaseError
 * @method isError
 * @static
 */
util.staticMethod(Ero, 'isError', isInstanceOfBaseError);

/**
 * @alias #isInstanceOfBaseError
 * @method isCustomError
 * @static
 */
util.staticMethod(Ero, 'isCustomError', isInstanceOfBaseError);

/**
 * Assigns own enumerable properties of meta to the err.meta.
 *
 * If the err.meta is undefined before assigning, it will be assigned a new object,
 * and then the own enumerable properties of second parameter will be assigned to err.meta.
 * If the err.meta is not undefined, it should be a plain object.
 *
 * The properties of meta will overwrite the properties of err.meta, if they have same name.
 *
 * @side_effect  err, err.meta
 * @method addMeta
 * @param  {Error}  err  the instance of Error class or Error subclass
 * @param  {Object} meta
 * @return {undefined}
 * @static
 */
util.staticMethod(Ero, 'addMeta', function addMeta(err, meta) {
    if (!err.meta) err.meta = {};
    util.extend(err.meta, meta);
});

module.exports = Ero;
