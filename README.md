# Ero.js

An error library provides simple functions for building your own customized errors.

## Document Translations

[简体中文](./doc/README.zh-Hans.md)

## Installation

`npm install --save ero`

## Quick Start

It is highly recommended that you should wrap the `ero` library to extend your own error module.

Edit a file. e.g. `error.js`:

```js
// error.js
var Errors = require('ero');

// define an error template
var errorTemplate = {
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

// initialize the ero library
Errors.init({
    template: errorTemplate,
    definitions: definitions,
});

// export the Errors
module.exports = Errors;
```

In another file, require your error module:

```js
var Errors = require('./error');

// use the defined errors
// assume that there is a meta obejct
var meta = {
    a: 1,
    b: [2, 3, 4],
    c: {}
}

// new an error instance with an additional meta object
// and the message can be sprintf-like format string, which is implemented by [alexei/sprintf.js](https://github.com/alexei/sprintf.js)
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

## Error Template

The error template is used to constrain the properties of the error definition.

If a property is absent in error definition while it is required by template, it will throw an error when initialize the `ero` library.  
Furthermore, the template can also set default values for the properties of all error definitions, in order to simplify codes.

The `message` property of template do nothing besides force the developer to explain the meaning of each property of error definition.

## Error Definitions

Each error definition is used to create the corresponding error class.

Each error definition is defined by `<error name>: <properties definitions>`, which `<error name>` should be unique.

`Properties definitions` is an object composed of many key/value pairs.
It will be assigned to the prototype of corresponding error class, as the default value for each error instance.

## API

see http://adoyle.me/Ero.js/

## Versioning

The versioning follows the rules of SemVer 2.0.0.

**BUT**, anything may have **BREAKING CHANGES** at **ANY TIME** when major version is zero (0.y.z), which is for initial development and the public API should not be considered stable.

For more information on SemVer, please visit http://semver.org/.

## Copyright and License

Copyright 2015-2016 ADoyle

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

See the NOTICE file distributed with this work for additional information regarding copyright ownership.
