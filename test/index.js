'use strict';

var mochaRunner = require('./mocha_runner');

var mocha = mochaRunner.init();

if (!module.parent) {
    mocha.run(function(failures) {
        process.exit(failures);
    });
} else {
    module.exports = mocha;
}
