'use strict';

/**
 * It will be better if you would comment every property to explain how it effects.
 *
 * Relative paths are relative to the directory where the process starts.
 */
var config = {
    tasks: {
        /**
         * clean task uses `sindresorhus/del`, whose glob rules are different from gulp's.
         * see https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md
         */
        clean: {
        },

        release: {
            changelog: {
                name: 'ChangeLog.md',
            },
            license: {
                src: [
                    'src/**/*', 'index.js', 'package.json', 'README.md',
                    'LICENSE', 'NOTICE',
                    '!**/*._*', '!**/.DS_Store',
                ],
                srcOpts: {
                    base: './',
                },
                dest: './release',
                year: '2015-2016',
                author: 'ADoyle',  // default author for all files
                license: 'Apache',  // default license for all files
                matches: [{  // it could be empty array if you do not need specify files with other license
                    glob: ['**/*.js'],
                    license: 'Apache',  // override the default license
                    // author: 'Belly',  // override the default author
                }],
            },
            npm: {
                src: './release',
                dest: './release',
            },
            'git-tag': {
                dest: 'master',  // branch name or commit hash
            },
        },

        lint: {
            src: [
                '**/*.js',
                '!node_modules/**',
                '!release/**',
                '!doc/**',
                '!gh-pages/**',
            ],
            // see https://github.com/adametry/gulp-eslint#eslintoptions
            eslintOptions: {
                quiet: true,
            },
        },

        test: {
            mochaRunner: '../../test/index',
        },
    },
};

module.exports = config;
