# Ero.js

An error library provides simple functions for building your own customized errors.

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
};

// define a set of error definitions
var definitions = {
    Error: {
        code: '001',
        logLevel: 'error',
    },
    RejectError: {
        code: '002',
        captureErrorStack: false,
        statusCode: 400,
        logLevel: false,
    },
    NotFoundError: {
        code: '003',
        captureErrorStack: false,
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
console.log('captureErrorStack: ', e.captureErrorStack);
console.log('statusCode: ', e.statusCode);
console.log('logLevel: ', e.logLevel);
```

## API

## Copyright and License

Copyright 2015 ADoyle

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

See the NOTICE file distributed with this work for additional information regarding copyright ownership.
