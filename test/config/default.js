'use strict';

module.exports = {
    cases: {
        '.': true,
    },
    stackTraceLimit: Infinity,  // Integer or Infinity. Cannot be zero.
    reporter: 'spec',           // refer to http:// mochajs.org/#reporters
    ui: 'bdd',                  // refer to http:// mochajs.org/#interfaces
    inlineDiffs: false,         // true or false
    slow: 0,                    // microsecond
    timeout: 10000,             // microsecond
    bail: false,                // true or false
    grep: false,                // RegExp or String or false
    invert: false,              // true or false
    asyncOnly: false,           // true or false
    colors: true,               // true or false
    ignoreLeaks: true,          // true or false
    growl: true,                // true or false
};
