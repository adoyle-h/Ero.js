# Ero.js
![Node Version][Node Version Image]
[![Npm Package Version][Npm Package Version Image]][Npm Package Version LINK]
[![License][License Image]][License LINK]
![NodeJS Package Dependencies][NodeJS Package Dependencies Link]
[![Build Status][Build Status Image]][Build Status Link]
[![Code Climate][Code Climate Image]][Code Climate Link]
[![Test Coverage][Test Coverage Image]][Test Coverage Link]

一个提供了一些简单的函数的类库，用于构建你自己的自定义错误。

## TOC

<!-- MarkdownTOC -->

- [安装 \(Installation\)](#安装-installation)
- [快速上手 \(Quick Start\)](#快速上手-quick-start)
- [基本概念 \(Basic Concepts\)](#基本概念-basic-concepts)
    - [Ero 类](#ero-类)
    - [错误模板 \(Error Template\)](#错误模板-error-template)
    - [错误定义 \(Error Definitions\)](#错误定义-error-definitions)
    - [错误基类 \(BaseError\)](#错误基类-baseerror)
    - [错误类 \(Error Class\)](#错误类-error-class)
- [特性 \(Feature\)](#特性-feature)
    - [创建不捕获堆栈信息的错误实例](#创建不捕获堆栈信息的错误实例)
    - [多 Ero 实例](#多-ero-实例)
    - [支持 sprintf 语法](#支持-sprintf-语法)
    - [附加元数据 \(additional metadata\)](#附加元数据-additional-metadata)
    - [创建错误实例时，更灵活地传参](#创建错误实例时，更灵活地传参)
    - [嵌套错误信息](#嵌套错误信息)
- [API](#api)
- [版本 \(Versioning\)](#版本-versioning)
- [版权声明 \(Copyright and License\)](#版权声明-copyright-and-license)

<!-- /MarkdownTOC -->


<a name="安装-installation"></a>
## 安装 (Installation)

`npm install --save ero`

<a name="快速上手-quick-start"></a>
## 快速上手 (Quick Start)

强烈推荐你二次封装 `ero` 库，以此来扩展出你自己的错误模块。

编辑一个文件。比如 `error.js`：

```js
// error.js
var Ero = require('ero');

// 定义一个错误模板，用来规范错误类定义 (error definition) 的属性
var errorTemplate = {
    // 下一行代表着每个错误类定义**必须**包含 code 字段，'The error code' 用来描述这个字段的作用
    code: 'The error code',
    /**
     * 下一行代表着每个错误类定义**可以**包含 captureStackTrace 字段，
     * message 字段用来描述这个字段的作用，
     * required 表示这个字段是否必须定义，
     * 当 required 为 false 时，需要提供 default 表示 captureStackTrace 的默认值。
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

// 创建 ero 实例
var ero = new Ero({
    template: errorTemplate,
    definitions: definitions,
});

module.exports = ero;
```

在另一个文件中，引用你的错误模块：

```js
var ero = require('./error');
var Errors = ero.Errors;

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

<a name="基本概念-basic-concepts"></a>
## 基本概念 (Basic Concepts)

<a name="ero-类"></a>
### Ero 类

`new Ero()` 生成一个 ero 实例，相当于一个存放错误类型的空间，同时这个空间提供一些工具方法。

ero 空间有以下主要成员：

- [template](#错误模板-error-template)
- [BaseError](#错误基类-baseerror)
- [Errors](#错误类-error-class): 所有自定义的错误类都放在这里

每个 ero 空间都是独立的，互不影响。

Ero 还提供一些工具函数，如 `Ero.isCustomError`，具体请看 [API 文档][API - Ero]。

<a name="错误模板-error-template"></a>
### 错误模板 (Error Template)

错误模板用于约束错误定义中的属性。  
如果错误定义中缺少某个模板中设定为必选的属性，则在 `ero` 初始化的时候就会报错，以提醒开发者。  
同时，模板也可以为所有错误定义的属性设定默认值，方便简化代码。

错误模板中的 `message`，是为了强制让开发者解释每个错误属性的含义，别无它用。

可以通过 `ero.template` 得到标准化后的错误模板。

<a name="错误定义-error-definitions"></a>
### 错误定义 (Error Definitions)

每一个错误定义 (Error Definition) 用于创建对应的错误类 (Error Class)。

每一个错误定义是由 `<错误名称>: <属性定义>` 组成的键值对。错误名称必须唯一。

属性定义是一个由许多键值对组成的对象 (Object)，它将被赋值到对应错误类的原型链上，作为每个错误实例的默认值。


<a name="错误基类-baseerror"></a>
### 错误基类 (BaseError)

本类库提供了一个 BaseError 作为 Ero 空间内自定义错误类的基类。

这个基类有以下几个属性：

- meta: {Object} 错误的元数据
- message: {String} 错误信息
- [stack]: {String} 错误堆栈，只当 `captureStackTrace` 为 `true` 时存在
- captureStackTrace: {Boolean} 是否捕捉错误堆栈，默认为 `true`
- name: {String} 错误类的名字
- ERROR_STACK_SEPARATOR: {String} 多个错误堆栈之间的分隔符
- MESSAGE_CONNECTOR: {String} 多个错误信息之间的连接符

BaseError 可以通过 `ero.BaseError` 得到。

更多信息请看 [`API 文档 - BaseError`][API - BaseError]

<a name="错误类-error-class"></a>
### 错误类 (Error Class)
你提供的每个错误定义 (Error Definitions)，将会生成对应的错误类。错误类都是继承自 [`BaseError`][BaseError] 这个基类。

`BaseError` 提供了功能丰富的构造函数，方便你在创建错误实例时，附加更多有用的信息。

错误类会放在 `ero.Errors` 中，默认包含 `ero.Errors.BaseError`。

<a name="特性-feature"></a>
## 特性 (Feature)

<a name="创建不捕获堆栈信息的错误实例"></a>
### 创建不捕获堆栈信息的错误实例

`error.stack` 并不是必有属性。意味着 `var error = new Errors.SubError();` 时，可以不捕获错误堆栈。因为存在这样的场景，开发者需要创建错误实例，但不关心错误堆栈。
（仅当 `SubError` 的 `captureStackTrace` 属性的值为 `false` 时才不会捕获堆栈。具体实现机制请去看 [BaseError][]）

另外，当 `captureStackTrace` 为 `true` 时，并不代表着创建 error 实例时就会去收集错误堆栈。  
根据 v8 引擎的特性，只有使用 error.stack 的时候才会去收集，这在 Ero.js 这个库里也是同样处理的，同时[嵌套错误](#嵌套错误信息)时也是同样的处理。

<a name="多-ero-实例"></a>
### 多 Ero 实例

大多数情况下，如构建服务器应用，你只需要创建一个 Ero 来定义你自己的错误类型。  
对于框架级别的库，你可以创建多个 Ero，分别提供框架层的错误类，以及用户层的错误类。  
对于类库级别的库，个人觉得你不需要使用本项目，用 nodejs 自带的 Error 足矣。

**注意**，不同 Ero 实例中的 template、BaseError、Errors 都是互相独立的，因此 `ero.isCustomError` 只能判断当前 Ero 实例下的错误，**而不能判断其他 Ero 实例下定义的错误**。

<a name="支持-sprintf-语法"></a>
### 支持 sprintf 语法

错误信息可以使用 sprintf 类似的语法，实际上它是通过 [alexei/sprintf.js](https://github.com/alexei/sprintf.js) 实现的

```js
var err = new Errors.BaseError('%s is %s', 'something', 'wrong');
console.log(err.message); // => 'something is wrong'
```

<a name="附加元数据-additional-metadata"></a>
### 附加元数据 (additional metadata)

元数据是为了提供除了 message，stack 以外的附加信息，比如运行时的上下文。

你也许看到过有人将键值对放入以 `key=value` 的形式写入 message 里。
一旦有了元数据，就无需将键值对写入 message 里了，省去了 format 和提取数据的步骤。直接以 json 的形式附加在 `error.meta` 上。

<a name="创建错误实例时，更灵活地传参"></a>
### 创建错误实例时，更灵活地传参

你可以添加一些元数据：

```js
var meta = {a: 1, b: '2', c: [3], d: true};
var err = new Errors.BaseError(meta, '%s is %s', 'something', 'wrong');
console.log(err.meta);  // meta 将会存储在 err.meta 中
```

你可以结合上一个错误：

```js
var firstErr = new Error('the first error');
var secondMeta = {a: 1, b: 3};
var secondErr = new Errors.BaseError(firstErr, secondMeta, 'the second error');
var thirdMeta = {b: '2', c: [3], d: true};
var thirdErr = new Errors.BaseError(thirdMeta, secondErr, '%s is %s', 'something', 'wrong');
console.log(thirdErr.message);  // 三个错误的 message 将会串联起来
console.log(thirdErr.meta);  // secondMeta 和 thirdMeta 将会存储在 err.meta 中。同名的属性，最新的会覆盖老的
console.log(thirdErr.stack);  // 三个错误的堆栈信息将会串联起来
```

**err 和 meta 是顺序无关的，只要保证在 message 之前即可。**

当然，error、meta、message 都是可选参数：

```js
var err = new Errors.BaseError();
```

<a name="嵌套错误信息"></a>
### 嵌套错误信息

```js
var firstErr = new Error('the first error');
var secondErr = new Errors.BaseError(firstErr, 'the second error');
var thirdErr = new Errors.BaseError(secondErr, '%s is %s', 'something', 'wrong');
console.log(thirdErr.message);  // 三个错误的 message 将会串联起来
console.log(thirdErr.meta);  // secondMeta 和 thirdMeta 将会存储在 err.meta 中。同名的属性，最新的会覆盖老的
console.log(thirdErr.stack);  // 三个错误的堆栈信息将会串联起来
```

- stack 默认会使用 `\n==== Pre-Error-Stack ====\n` 连接多个 `error.stack`。
- message 默认会使用 ` && ` 来连接多个 `error.message`。
- meta，会合并多个 `error.meta`

你可以自定义 stack 和 message 的连接符。

<a name="api"></a>
## API

API 的具体使用，以及 README 中未提到的细节请看 [API 文档][API]。

<a name="版本-versioning"></a>
## 版本 (Versioning)

版本迭代遵循 SemVer 2.0.0 的规则。

*但是*，当主版本号是零（0.y.z），一切*随时*都可能有*不兼容的修改*。这处于开发初始阶段，其公共 API 是不稳定的。

关于 SemVer 的更多信息，请访问 http://semver.org/

<a name="版权声明-copyright-and-license"></a>
## 版权声明 (Copyright and License)

Copyright (c) 2015-2016 ADoyle. The project is licensed under the **Apache License Version 2.0**.

See the [LICENSE][] file for the specific language governing permissions and limitations under the License.

See the [NOTICE][] file distributed with this work for additional information regarding copyright ownership.


<!-- Links -->

[LICENSE]: ./LICENSE
[NOTICE]: ./NOTICE
[BaseError]: #错误基类-baseerror
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
