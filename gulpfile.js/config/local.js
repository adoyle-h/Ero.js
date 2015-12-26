'use strict';

module.exports = {
    tasks: {
        lint: {
            src: [
                '**/*.js',
                '!node_modules/**',
                '!release/**',
                '!experimental/**',
                '!sub_config.js',
                '!app.js',
                '!log/handlers.js',
            ],
        },
    },
};
