'use strict';

var config = {
    root: {
        src: './src',
        dest: './public',
    },
    /**
     * 每个 task 必须至少存在以下字段：
     *   - src: 起始路径
     *   - dest: 目标路径
     */
    tasks: {
        lint: {
            src: [
                '!./node_modules/**',
                './**/*.js',
            ],
        },

        watch: {

        },

        font: {

        },

        image: {

        },

        html: {

        },

        js: {
            src: 'javascripts',
            dest: 'javascripts',
            extractSharedJs: true,
            entries: {
                'app': ['./app.js'],
                'page': ['./page.js'],
            },
            extensions: ['js'],
        },

        css: {
            src: 'stylesheets',
            dest: 'stylesheets',
            autoprefixer: {
                'browsers': ['last 3 version'],
            },
            sass: {
                indentedSyntax: true,
            },
            extensions: ['sass', 'scss', 'css'],
        },

        images: {
            src: 'images',
            dest: 'images',
            extensions: ['jpg', 'png', 'svg', 'gif'],
        },

        fonts: {
            src: 'fonts',
            dest: 'fonts',
            extensions: ['woff2', 'woff', 'eot', 'ttf', 'svg'],
        },

        iconFont: {
            src: 'icons',
            dest: 'fonts',
            sassDest: 'generated',
            extensions: ['woff2', 'woff', 'eot', 'ttf', 'svg'],
        },
    },
};

module.exports = config;
