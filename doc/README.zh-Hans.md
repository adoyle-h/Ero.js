# Ero.js
![Node Version][Node Version Image]
[![Npm Package Version][Npm Package Version Image]][Npm Package Version LINK]
[![License][License Image]][License LINK]
![NodeJS Package Dependencies][NodeJS Package Dependencies Link]
[![Build Status][Build Status Image]][Build Status Link]
[![Code Climate][Code Climate Image]][Code Climate Link]
[![Test Coverage][Test Coverage Image]][Test Coverage Link]

一个提供了一些简单的函数的类库，用于构建你自己的自定义错误。

## 安装（Installation）

`npm install --save ero`

## 快速上手（Quick Start）

强烈推荐你二次封装 `ero` 库，以此来扩展出你自己的错误模块。

编辑一个文件。比如 `error.js`：

```js
// error.js
var Errors = require('ero');

// 定义一个错误模板
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

// 创建一系列错误类的定义
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

// 初始化 ero
Errors.init({
    template: errorTemplate,
    definitions: definitions,
});

// 将 Errors 导出
module.exports = Errors;
```

在另一个文件中，引用你的错误模块：

```js
var Errors = require('./error');

// 使用你自定义的错误类
// 假设有一个元数据(meta)
var meta = {
    a: 1,
    b: [2, 3, 4],
    c: {}
}

// 创建一个错误实例，并把元数据与这个实例绑定
// 错误信息可以使用 sprintf 类似的语法，实际上它是通过 [alexei/sprintf.js](https://github.com/alexei/sprintf.js) 实现的
// 请看 http://adoyle.me/Ero.js/#!/api/BaseError 了解关于构造函数参数的更多信息
var e = new Errors.Error(meta, '%s is %s', 'something', 'wrong');

// 你可以得到错误实例的一些属性
console.log('message: ', e.message);
console.log('name: ', e.name);
console.log('stack: ', e.stack);
console.log('meta: ', e.meta);
console.log('code: ', e.code);
console.log('captureStackTrace: ', e.captureStackTrace);
console.log('statusCode: ', e.statusCode);
console.log('logLevel: ', e.logLevel);
```

## 错误模板（Error Template）

错误模板用于约束错误定义中的属性。  
如果错误定义中缺少某个模板中设定为必选的属性，则在 `ero` 初始化的时候就会报错，以提醒开发者。  
同时，模板也可以为所有错误定义的属性设定默认值，方便简化代码。

错误模板中的 `message`，是为了强制让开发者解释每个错误属性的含义，别无它用。

## 错误定义（Error Definitions）

每一个错误定义(Error Definition)用于创建对应的错误类（Error Class）。

每一个错误定义是由 `<错误名称>: <属性定义>` 组成的。错误名称必须唯一。

属性定义是一个由许多键值对组成的对象（Object），它将被赋值到对应错误类的原型链上，作为每个错误实例的默认值。

## 错误类（Error Class）
你提供的每个错误定义（Error Definitions），将会生成对应的错误类。错误类都是继承自 [`BaseError`](http://adoyle.me/Ero.js/#!/api/BaseError) 这个基类。

`BaseError` 提供了功能丰富的构造函数，方便你在创建错误实例时，附加更多有用的信息。

假设已生成 `Errors.Error` 这个子类，你可以这么使用它：

```js
// 错误信息可以使用 sprintf 类似的语法，实际上它是通过 [alexei/sprintf.js](https://github.com/alexei/sprintf.js) 实现的
var err = new Errors.Error('%s is %s', 'something', 'wrong');
```

你可以添加一些元数据：

```js
var meta = {a: 1, b: '2', c: [3], d: true};
var err = new Errors.Error(meta, '%s is %s', 'something', 'wrong');
console.log(err.meta);  // meta 将会存储在 err.meta 中
```

你可以结合上一个错误：

```js
var firstErr = new Error('the first error');
var secondMeta = {a: 1, b: 3};
var secondErr = new Errors.Error(firstErr, secondMeta, 'the second error');
var thirdMeta = {b: '2', c: [3], d: true};
// err 和 meta 是顺序无关的，只要保证在 message 之前即可
var thirdErr = new Errors.Error(thirdMeta, secondErr, '%s is %s', 'something', 'wrong');
console.log(thirdErr.message);  // 三个错误的 message 将会串联起来
console.log(thirdErr.meta);  // secondMeta 和 thirdMeta 将会存储在 err.meta 中。同名的属性，最新的会覆盖老的
console.log(thirdErr.stack);  // 三个错误的堆栈信息将会串联起来
```

当然，这 error、meta、message 都是可选的：

```js
var err = new Errors.Error();
```

## API

请看 http://adoyle.me/Ero.js/

## 版本（Versioning）

版本迭代遵循 SemVer 2.0.0 的规则。

*但是*，当主版本号是零（0.y.z），一切*随时*都可能有*不兼容的修改*。这处于开发初始阶段，其公共 API 是不稳定的。

关于 SemVer 的更多信息，请访问 http://semver.org/。

## 版权声明（Copyright and License）

Copyright 2015-2016 ADoyle

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

See the NOTICE file distributed with this work for additional information regarding copyright ownership.


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
