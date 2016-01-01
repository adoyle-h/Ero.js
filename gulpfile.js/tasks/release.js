'use strict';

/**
 * @param  {Object}  gulp    The gulp object
 * @param  {Object}  config  The configuration for gulp tasks. To get a property using `config.a.b.c` or `config.get('a.b.c')`
 * @param  {Object}  LL      Lazy required libraries and other data
 * @param  {Object}  args    The parsed arguments from comment line
 */
module.exports = function(gulp, config, LL, args) {  // eslint-disable-line no-unused-vars
    gulp.task('release:license', ['clean:release'], function() {
        var conf = config.get('tasks.release.license');
        var license = LL.license;
        var filter = LL.filter;

        var matches = conf.get('matches');
        var author = conf.get('author');
        var defaultLicense = conf.get('license');
        var year = conf.get('year');

        var stream = gulp.src(conf.get('src'), conf.get('srcOpts'));

        matches.forEach(function(matchObj) {
            var f = filter(matchObj.glob, {restore: true});
            stream = stream.pipe(f)
                .pipe(license(matchObj.license || defaultLicense, {
                    year: matchObj.year || year,
                    organization: matchObj.author || author,
                }))
                .pipe(f.restore);
        });

        return stream.pipe(gulp.dest(conf.get('dest')));
    });

    gulp.task('release:npm-pack', ['clean:npm-package'], function(done) {
        var conf = config.get('tasks.release.npm');
        var Path = LL.Path;
        var CP = LL.CP;
        var util = LL.nodeUtil;
        var packageJSON = LL.packageJSON;

        var src = Path.resolve(conf.get('src'));
        var dest = Path.resolve(conf.get('dest'));
        var destFile = util.format('%s/%s.tgz', dest, packageJSON.name);
        var packageName = src.split('/').pop();

        var command = util.format('tar -czf %s -C %s %s', destFile, Path.resolve(src, '..'), packageName);

        CP.exec(command, done);
    });

    gulp.task('release:npm-publish', function(done) {
        var conf = config.get('tasks.release.npm');
        var Path = LL.Path;
        var CP = LL.CP;
        var util = LL.nodeUtil;
        var packageJSON = LL.packageJSON;

        var dest = Path.resolve(conf.get('dest'));
        var destFile = util.format('%s/%s.tgz', dest, packageJSON.name);

        var command = util.format('npm publish --access public %s', destFile);

        CP.exec(command, done);
    });

    gulp.task('release:pre', function(done) {
        var CP = LL.CP;

        var command = '\
            git add . && \
            git stash save "stash for release" && \
            git fetch --prune && \
            git rebase origin/develop release \
        ';
        CP.exec(command, done);
    });

    gulp.task('release:changelog:touch', function(done) {
        var name = config.get('tasks.release.changelog.name');
        LL.CP.exec('touch ' + name, done);
    });

    gulp.task('release:changelog', ['release:changelog:touch'], function(done) {
        var CP = LL.CP;
        var util = LL.nodeUtil;
        var changelog = LL.changelog;
        var conf = config.get('tasks.release.changelog');
        var name = conf.get('name');

        gulp.src(name, {
            buffer: false,
        })
            .pipe(changelog({
                preset: 'angular',
            }))
            .pipe(gulp.dest('./'))
            .on('end', function() {
                var packageJSON = LL.reload('packageJSON');
                var tag = packageJSON.version;
                var command = util.format('\
                    git add %s && \
                    git commit -m "update version to %s" --no-edit \
                ', name, tag);
                CP.exec(command, done);
            })
            .on('error', done);
    });

    /**
     * gulp release:bump [options]
     *
     * options:
     *     -t --type [major, minor, patch]  Semver 2.0. default to patch
     *     -v --version VERSION  Bump to a specific version
     */
    gulp.task('release:bump', function(done) {
        var Path = LL.Path;
        var CP = LL.CP;

        var bumpOpts = {
            key: 'version',
            indent: 2,
        };

        var version = args.v || args.version;
        var type = args.t || args.type || 'patch';

        if (version) {
            bumpOpts.version = version;
        } else {
            bumpOpts.type = type;
        }

        gulp.src(Path.resolve('./package.json'))
            .pipe(LL.bump(bumpOpts))
            .pipe(gulp.dest('./'))
            .on('end', function() {
                CP.exec('git add package.json', done);
            })
            .on('error', done);
    });

    gulp.task('release:branch', function(done) {
        var CP = LL.CP;
        var util = LL.nodeUtil;
        var command = util.format('\
            git fetch --prune && \
            git rebase origin/develop develop && \
            git merge --no-ff --no-edit release && \
            git rebase origin/master master && \
            git merge --no-ff --no-edit release \
        ');
        CP.exec(command, done);
    });

    gulp.task('release:tag', function(done) {
        var CP = LL.CP;
        var util = LL.nodeUtil;
        var packageJSON = LL.reload('packageJSON');
        var tag = packageJSON.version;
        var conf = config.get('tasks.release.git-tag');
        var commitHash = conf.get('dest');

        var command = util.format('git tag -a v%s %s -m "release version %s"', tag, commitHash, tag);
        CP.exec(command, done);
    });

    gulp.task('release:push', function(done) {
        var CP = LL.CP;
        var command = '\
            git push origin develop && \
            git push origin master && \
            git push origin release && \
            git push --tags \
        ';
        CP.exec(command, done);
    });

    gulp.task('release:code', function(done) {
        LL.runSequence(
            'lint',
            'test',
            'release:pre',
            'release:bump',
            'release:changelog',
            'release:branch',
            'release:tag',
            'release:push',
            done
        );
    });

    gulp.task('release', function(done) {
        LL.runSequence(
            'release:code',
            'release:license',
            'release:npm-pack',
            'release:npm-publish',
            done
        );
    });
};
