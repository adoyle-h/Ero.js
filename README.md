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
- [Feature](#feature)
    - [Specify and unify error classes and its properties](#specify-and-unify-error-classes-and-its-properties)
    - [Creating error instance without capturing stack trace](#creating-error-instance-without-capturing-stack-trace)
    - [Inheriting error informations in chain](#inheriting-error-informations-in-chain)
    - [Supporting sprintf-like syntax](#supporting-sprintf-like-syntax)
    - [Additional default properties to error instance](#additional-default-properties-to-error-instance)
    - [Additional metadata](#additional-metadata)
    - [More flexible parameters transfer, when create an instance](#more-flexible-parameters-transfer-when-create-an-instance)
    - [Multi Error Spaces](#multi-error-spaces)
- [Basic Concepts](#basic-concepts)
    - [Ero Class](#ero-class)
    - [Error Template](#error-template)
    - [Error Definitions](#error-definitions)
    - [BaseError](#baseerror)
    - [Error Class](#error-class)
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
var Ero = require('ero');

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
var ero = require('./error');
// Get your customized error classes via ero.Errors. All definitions defined above will be implemented in it.
var Errors = ero.Errors;
// You could look into the BaseError. Attention! The BaseErrors from different Ero instances are not equal.
// You will never use the BaseError directly in general scenarios.
var BaseError = ero.BaseError;

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

// You could judge whether the error instance belongs to the ero instance.
ero.isError(e);  // => true
ero.isError(new Error());  // => false
```

<a name="feature"></a>
## Feature

<a name="specify-and-unify-error-classes-and-its-properties"></a>
### Specify and unify error classes and its properties

Using [`Template`](#error-template) to unify the properties which each error class should have.

Using [`Definition`](#error-definitions) to specify the kind of error class, and its default property value.

Pros:

- Abstracting similar errors to `Class`. Judging the type via `instanceof`.
- Extending default properties to error instance.
- Providing a file to manage all the error classes for looking up.
- Specifying each property of error.
- Using `Template` to unify error class definition for avoiding code typos.

<a name="creating-error-instance-without-capturing-stack-trace"></a>
### Creating error instance without capturing stack trace

`error.stack` is not required. It means that calling `var error = new Errors.SubError();` could not capture the error stack. (It would not capture stack error, only when `SubError.captureStackTrace` is `false`. Refer to [BaseError][] for More informations)

Because there are some scenarios that developers need to create a error instance, while do not care about its error stack.

Besides, when `captureStackTrace` is `true` it does not mean that the stack traces will be collected at the time of creating an error instance.

As same as the mechanism of v8 engine, Ero.js will collect the stack traces only when `error.stack` is called. The [nested error](#nested-error-informations) procedure is in a similar way.


<a name="inheriting-error-informations-in-chain"></a>
### Inheriting error informations in chain

```js
var firstErr = new Error('the first error');
var secondErr = new Errors.BaseError(firstErr, 'the second error');
var thirdErr = new Errors.BaseError(secondErr, '%s is %s', 'something', 'wrong');
console.log(thirdErr.message);  // These three error messages will be together in a series.
console.log(thirdErr.meta);  // The secondMeta and thirdMeta will be added to err.meta. The last is prior to the old, when they have same name of key.
console.log(thirdErr.stack);  // These three error stacks will be together in a series.
```

- `stack` default to using `'\n==== Pre-Error-Stack ====\n'` to separate multi `error.stack`.
- `message` default to using `' && '` to connect multi `error.message`.
- `meta` will merge multi `error.meta`.

You can set the stack separator and the message connector for all errors in each ero instance.

For example, you could invoke `ero.setErrorStackSeparator('\nFrom previous event:\n')` to get the promise-like stack output.  
Plus, invoke `ero.setMessageConnector(', ')` to replace the default message connector for multi error messages.

<a name="supporting-sprintf-like-syntax"></a>
### Supporting sprintf-like syntax

The error message can be sprintf-like format string, which is implemented by [alexei/sprintf.js](https://github.com/alexei/sprintf.js) actually.

```js
var err = new Errors.BaseError('%s is %s', 'something', 'wrong');
console.log(err.message); // => 'something is wrong'
```

<a name="additional-default-properties-to-error-instance"></a>
### Additional default properties to error instance

<a name="additional-metadata"></a>
### Additional metadata

Each error instance has a `meta` property.

Metadata is used to provide some runtime informations besides message and stack, such as runtime content, request parameters and so on.

You may see the `key=value` format in an error message. Once the metadata is available, you should just put your data into `error.meta` as json. It will save much time for formatting and querying.

<a name="more-flexible-parameters-transfer-when-create-an-instance"></a>
### More flexible parameters transfer, when create an instance

To add some meta data:

```js
var meta = {a: 1, b: '2', c: [3], d: true};
var err = new Errors.BaseError(meta, '%s is %s', 'something', 'wrong');
console.log(err.meta);  // The meta will be added to err.meta
```

To be combined with an error

```js
var firstErr = new Error('the first error');
var secondMeta = {a: 1, b: 3};
var secondErr = new Errors.BaseError(firstErr, secondMeta, 'the second error');
var thirdMeta = {b: '2', c: [3], d: true};
var thirdErr = new Errors.BaseError(thirdMeta, secondErr, '%s is %s', 'something', 'wrong');
console.log(thirdErr.message);  // These three error messages will be together in a series.
console.log(thirdErr.meta);  // The secondMeta and thirdMeta will be added to err.meta. The last is prior to the old, when they have same name of key.
console.log(thirdErr.stack);  // These three error stacks will be together in a series.
```

**The error and meta are order-uncorrelated. Just make sure they are appeared before message.**

Certainly, error, meta, message are optional parameters:

```js
var err = new Errors.BaseError();
```
<a name="multi-error-spaces"></a>
### Multi Error Spaces

You could create multi `Ero` instance.

In most cases, like building a web server application, you only need one ero instance for customizing your errors.

For framework libraries, you could create multi ero instances, for providing the error classes for framework layer and user layer.

For class libraries, I think it is unnecessary to use this project and the native error class is enough.

**Attentions**: the `template`, `BaseError` and `Errors` are independent between different ero instances. Thus `ero.isCustomError` could only recognize the errors which created based on the `Errors` in an ero.


<a name="basic-concepts"></a>
## Basic Concepts

<a name="ero-class"></a>
### Ero Class

`new Ero()` create an `Ero` instance, which is a space storing error classes, and providing some utility functions.

Ero contains these members as below:

- [template](#error-template)
- [BaseError](#baseerror)
- [Errors](#error-class): All customized errors are put here.

Each Ero space are independent.

Ero provides some utility functions, such as `Ero.isCustomError`. Please refer to [API document][API - Ero].

<a name="error-template"></a>
### Error Template

The error template is used to constrain the properties of the error definition.

If a property is absent in error definition while it is required by template, it will throw an error when initialize the `ero` library.  
Furthermore, the template can also set default values for the properties of all error definitions, in order to simplify codes.

The `message` property of template do nothing besides force the developer to explain the meaning of each property of error definition.

The template could be referred by `ero.template`.

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

The `BaseError` could be referred by `ero.BaseError`.

Refer to [`API document - BaseError`][API - BaseError] for more details.

<a name="error-class"></a>
### Error Class
Each error definitions provided will be used to generate corresponding error classes, which are inherited from the [`BaseError`][BaseError] base class.

`BaseError` has a full featured constructor that is convenient for adding more useful information to error instance when you create it.

All customized error classes are put in `ero.Errors`, which already includes `BaseError`.

<a name="api"></a>
## API

The specifications of API, and details not mentioned in README, would be referenced at [API document][API].

<a name="versioning"></a>
## Versioning

The versioning follows the rules of SemVer 2.0.0.

**BUT**, anything may have **BREAKING CHANGES** at **ANY TIME** when major version is zero (0.y.z), which is for initial development and the public API should be considered unstable.

**When it is unstable, the version of installed package should be prefixed `~`.**

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
