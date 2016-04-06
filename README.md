# Ero.js
![Node Version][Node Version Image]
[![Npm Package Version][Npm Package Version Image]][Npm Package Version LINK]
[![License][License Image]][License LINK]
![NodeJS Package Dependencies][NodeJS Package Dependencies Link]
[![Build Status][Build Status Image]][Build Status Link]
[![Code Climate][Code Climate Image]][Code Climate Link]
[![Test Coverage][Test Coverage Image]][Test Coverage Link]

An error library provides simple functions for building your own customized errors.

## Document Translations

[简体中文](./doc/README.zh-Hans.md)

## TOC

<!-- MarkdownTOC -->

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Basic Concepts](#basic-concepts)
    - [Ero Class](#ero-class)
    - [Error Template](#error-template)
    - [Error Definitions](#error-definitions)
    - [BaseError](#baseerror)
    - [Error Class](#error-class)
- [Feature](#feature)
    - [Creating error instance without capturing stack trace](#creating-error-instance-without-capturing-stack-trace)
    - [Multi Ero Instances](#multi-ero-instances)
- [API](#api)
- [Versioning](#versioning)
- [Copyright and License](#copyright-and-license)

<!-- /MarkdownTOC -->


<a name="installation"></a>
## Installation

`npm install --save ero`

<a name="quick-start"></a>
## Quick Start

It is highly recommended that you should wrap the `ero` library to extend your own error module.

Edit a file. e.g. `error.js`:

```js
// error.js
var Errors = require('ero');

// define an error template for standardizing the properties of the error definition
var errorTemplate = {
    /**
     * Next line means that each error definition **MUST** contain the `code` property.
     * The 'The error code' is a description for this property.
     */
    code: 'The error code',
    /**
     * Next line means that each error definition **MAY** contain the `captureStackTrace` property.
     * `message` is a description for this property.
     * `required` indicates whether this property should be required.
     * `default` provide the default vaule of this property when `required` is `false`.
     */
    code: 'The error code',
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
};

// define a set of error definitions
var definitions = {
    Error: {
        code: '001',
        logLevel: 'error',
    },
    RejectError: {
        code: '002',
        captureStackTrace: false,
        statusCode: 400,
        logLevel: false,
    },
    NotFoundError: {
        code: '003',
        captureStackTrace: false,
        statusCode: 404,
        logLevel: 'info',
    },
};

// create an ero instance
var ero = new Ero({
    template: errorTemplate,
    definitions: definitions,
});

module.exports = ero;
```

In another file, require your error module:

```js
vvar ero = require('./error');
var Errors = ero.Errors;

// use the defined errors
// assume that there is a meta obejct
var meta = {
    a: 1,
    b: [2, 3, 4],
    c: {}
}

// new an error instance with an additional meta object
// and the message can be sprintf-like format string, which is implemented by [alexei/sprintf.js](https://github.com/alexei/sprintf.js)
// please see http://adoyle.me/Ero.js/#!/api/BaseError for more information about the constructor parameters
var e = new Errors.Error(meta, '%s is %s', 'something', 'wrong');

// see the properties of error instance
console.log('message: ', e.message);
console.log('name: ', e.name);
console.log('stack: ', e.stack);
console.log('meta: ', e.meta);
console.log('code: ', e.code);
console.log('captureStackTrace: ', e.captureStackTrace);
console.log('statusCode: ', e.statusCode);
console.log('logLevel: ', e.logLevel);
```

<a name="basic-concepts"></a>
## Basic Concepts

<a name="ero-class"></a>
### Ero Class

`new Ero()` create an ero instance, which is a space storing error classes, and providing some utility functions.

ero contains these members as below:

- [template](#error-template)
- [BaseError](#baseerror)
- [Errors](#error-class): All customized errors are put here.

Each ero space are independent.

Ero provides some utility functions, such as `Ero.isCustomError`. Please refer to [API document][API - Ero].

<a name="error-template"></a>
### Error Template

The error template is used to constrain the properties of the error definition.

If a property is absent in error definition while it is required by template, it will throw an error when initialize the `ero` library.  
Furthermore, the template can also set default values for the properties of all error definitions, in order to simplify codes.

The `message` property of template do nothing besides force the developer to explain the meaning of each property of error definition.

<a name="error-definitions"></a>
### Error Definitions

Each error definition is used to create the corresponding error class.

Each error definition is defined by a key/value pair `<error name>: <properties definitions>`, in which `<error name>` should be unique.

`Properties definitions` is an object composed of many key/value pairs.
It will be assigned to the prototype of corresponding error class, as the default value for each error instance.

<a name="baseerror"></a>
### BaseError

The Ero.js provides a `BaseError` class as the base class of all customized error classes.

`BaseError` class has properties as below:

- meta: {Object} The metadata for error.
- message: {String} The error message.
- [stack]: {String} The error stack. It is existed when `captureStackTrace` is `true`.
- captureStackTrace: {Boolean} Whether to capture the stack trace. Default to `true`.
- name: {String} The name of error class.
- ERROR_STACK_SEPARATOR: {String} The separator between multi error stacks.
- MESSAGE_CONNECTOR: {String} The connector between multi error messages.

Refer to [`API document - BaseError`][API - BaseError] for more details.

<a name="error-class"></a>
### Error Class
Each error definitions provided will be used to generate corresponding error classes, which are inherited from the [`BaseError`][BaseError] base class.

`BaseError` has a full featured constructor that is convenient for adding more useful information to error instance when you create it.

Assume that there is a `Errors.Error` class. Then you use it like that:

```js
// The message can be sprintf-like format string, which is implemented by [alexei/sprintf.js](https://github.com/alexei/sprintf.js)
var err = new Errors.Error('%s is %s', 'something', 'wrong');
```

To add some meta data:

```js
var meta = {a: 1, b: '2', c: [3], d: true};
var err = new Errors.Error(meta, '%s is %s', 'something', 'wrong');
console.log(err.meta);  // The meta will be added to err.meta
```

To be combined with an error

```js
var firstErr = new Error('the first error');
var secondMeta = {a: 1, b: 3};
var secondErr = new Errors.Error(firstErr, secondMeta, 'the second error');
var thirdMeta = {b: '2', c: [3], d: true};
// The err and meta are order-uncorrelated. Just make sure they are appeared before message.
var thirdErr = new Errors.Error(thirdMeta, secondErr, '%s is %s', 'something', 'wrong');
console.log(thirdErr.message);  // These three error messages will be together in a series.
console.log(thirdErr.meta);  // The secondMeta and thirdMeta will be added to err.meta. The last is prior to the old, when they have same name of key.
console.log(thirdErr.stack);  // These three error stacks will be together in a series.
```

Certainly, error, meta, message are optional parameters:

```js
var err = new Errors.Error();
```

<a name="feature"></a>
## Feature

<a name="creating-error-instance-without-capturing-stack-trace"></a>
### Creating error instance without capturing stack trace

`error.stack` is not required. It means that calling `var error = new Errors.SubError();` could not capture the error stack.
There is a scenario, developers need to create a error instance, while do not care about its error stack.

(It would not capture stack error, only when `SubError.captureStackTrace` is `false`. Refer to [BaseError][] for More informations)

<a name="multi-ero-instances"></a>
### Multi Ero Instances

In most cases, like building a web server application, you only need one ero instance for customizing your errors.

For framework libraries, you could create multi ero instances, for providing the error classes for framework layer and user layer.

For class libraries, I think it is unnecessary to use this project and the native error class is enough.

**Attentions**, the `template`, `BaseError` and `Errors` are independent between different ero instances. Thus `ero.isCustomError` could only recognize the errors which created based on the `Errors` in an ero.

<a name="api"></a>
## API

The specifications of API, and details not mentioned in README, would be referenced at [API document][API].

<a name="versioning"></a>
## Versioning

The versioning follows the rules of SemVer 2.0.0.

**BUT**, anything may have **BREAKING CHANGES** at **ANY TIME** when major version is zero (0.y.z), which is for initial development and the public API should not be considered stable.

For more information on SemVer, please visit http://semver.org/.

<a name="copyright-and-license"></a>
## Copyright and License

Copyright (c) 2015-2016 ADoyle. The project is licensed under the **Apache License Version 2.0**.

See the [LICENSE][] file for the specific language governing permissions and limitations under the License.

See the [NOTICE][] file distributed with this work for additional information regarding copyright ownership.


<!-- Links -->

[LICENSE]: ./LICENSE
[NOTICE]: ./NOTICE
[BaseError]: #baseerror
[API]: http://adoyle.me/Ero.js/
[API - BaseError]: http://adoyle.me/Ero.js/#!/api/BaseError
[API - Ero]: http://adoyle.me/Ero.js/#!/api/Ero


<!-- links -->

[Node Version Image]: https://img.shields.io/node/v/ero.svg
[Npm Package Version Image]: https://img.shields.io/npm/v/ero.svg
[Npm Package Version LINK]: https://www.npmjs.com/package/ero
[License Image]: https://img.shields.io/npm/l/ero.svg
[License LINK]: https://github.com/adoyle-h/Ero.js/blob/master/LICENSE
[NodeJS Package Dependencies Link]: https://david-dm.org/adoyle-h/Ero.js.svg
[Build Status Image]: https://travis-ci.org/adoyle-h/Ero.js.svg?branch=master
[Build Status Link]: https://travis-ci.org/adoyle-h/Ero.js
[Code Climate Image]: https://codeclimate.com/github/adoyle-h/Ero.js/badges/gpa.svg
[Code Climate Link]: https://codeclimate.com/github/adoyle-h/Ero.js
[Test Coverage Image]: https://codeclimate.com/github/adoyle-h/Ero.js/badges/coverage.svg
[Test Coverage Link]: https://codeclimate.com/github/adoyle-h/Ero.js/coverage
