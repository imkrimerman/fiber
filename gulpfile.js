'use strict';
var _ = require('lodash')
  , gulp = require('gulp')
  , inject = require('gulp-inject')
  , fs = require('fs')
  , path = require('path')
  , shell = require('shelljs')
  , mocha = require('gulp-mocha')
  , eslint = require('gulp-eslint')
  , connect = require('gulp-connect')
  , karma = require('karma')
  , packageJson = require('./package')

  , config = {
    input: 'fiber.js',
    output: 'build',
    test: 'test/**/*.spec.js',
    testDir: 'test',
    karma: {
      configFile: __dirname + '/karma.conf.js'
    },
    files: [
      // Helpers
      './src/Helpers/Version.js',
      './src/Helpers/fn.js',
      './src/Helpers/Class.js',
      './src/Helpers/Template.js',
      './src/Helpers/Validation.js',
      './src/Helpers/Delegator.js',

      // Extensions
      './src/Extensions/Access.js',
      './src/Extensions/Binder.js',
      './src/Extensions/Extend.js',
      './src/Extensions/Mixin.js',
      './src/Extensions/OwnProperties.js',

      // Base
      './src/Core.js',
      './src/Base/Class.js',
      './src/Base/Bag.js',

      // Services
      './src/Container.js',

      // Support
      './src/Support/Collection.js',
      './src/Support/ErrorBag.js',
      './src/Support/LinkedViews.js',
      './src/Support/Listeners.js',

      // Base components
      './src/Model.js',
      './src/Collection.js',
      './src/View.js',
      './src/CollectionView.js',

      // Routing
      './src/Support/RouterCollection.js',
      './src/Routing/HistoryItem.js',
      './src/Routing/HistoryCollection.js',
      './src/Routing/Route.js',
      './src/Routing/RouteCollection.js',
      './src/Routing/Middleware.js',
      './src/Routing/MiddlewareCollection.js',
      './src/Routing/Router.js',

      // Layout
      './src/Layout/Manager.js',

      // Application
      './src/Viewport.js',
      './src/Application.js',
    ]
  };

config.allFiles = config.files.concat([config.test]);

gulp.task('default', ['compile', 'tdd', 'serve', 'lint', 'watch']);
gulp.task('compile', ['build', 'build-test', 'build-doc', 'minify']);

gulp.task('dev', ['build', 'watch-dev']);
gulp.task('dev-doc', ['build', 'build-doc', 'watch-dev']);
gulp.task('dev-test', ['build', 'build-test', 'mocha', 'watch-dev-test']);

gulp.task('build', Build);
gulp.task('build-doc', BuildDocs);
gulp.task('build-test', BuildTest);
gulp.task('minify', Minify);

gulp.task('watch-dev', WatchDev);
gulp.task('watch-dev-test', WatchDevTest);
gulp.task('watch-lint', WatchLint);

gulp.task('karma', CreateKarmaServer(true));
gulp.task('tdd', CreateKarmaServer(false));

gulp.task('lint', Lint);
gulp.task('mocha', Mocha);

gulp.task('reload', function() {
  gulp.src(config.allFiles).pipe(connect.reload());
});

function Build() {
  return gulp.src(config.input)
    .pipe(inject(gulp.src(config.files, {read: false}), {
      removeTags: true,
      transform: function(filepath) {
        if (filepath.slice(-3) === '.js') {
          var contents = fs.readFileSync(path.join(__dirname, filepath)).toString();

          if (_.last(filepath.split('/')).replace('.js', '') === 'Version') {
            contents = contents.replace('$VERSION$', packageJson.version);
          }

          contents = contents.split("\n");
          for (var i = 0; i < contents.length; i ++) {
            if (! i) continue;
            contents[i] = "  " + contents[i];
          }
          return contents.join("\n");
        }
        // Use the default transform as fallback:
        return inject.transform.apply(inject.transform, arguments);
      }
    }))
    .pipe(gulp.dest(config.output))
    .pipe(connect.reload());
}

function BuildTest() {
  return gulp.src(config.testDir + '/runner.html')
    .pipe(inject(gulp.src(config.test, {read: false}), {
      relative: true,
      addPrefix: '.'
    }))
    .pipe(gulp.dest(config.testDir))
    .pipe(connect.reload());
}

function WatchLint() {
  gulp.watch(config.files, ['lint']);
  gulp.watch(config.allFiles, ['test']);
}

function WatchDev() {
  gulp.watch(config.files, ['build']);
}

function WatchDevDocs() {
  gulp.watch(config.files, ['build', 'build-doc']);
}

function WatchDevTest() {
  gulp.watch(config.allFiles, ['build', 'reload']);
}

function Lint() {
  return gulp.src(config.files)
    .pipe(eslint({
      configFile: './.eslintrc'
    }))
    .pipe(eslint.format());
}

function Mocha() {
  connect.server({
    root: './',
    port: 3030,
    livereload: true,
  });
}

function CreateKarmaServer(tdd) {
  return function(done) {
    config.karma.singleRun = tdd;
    new karma.Server(config.karma, done).start();
  };
}

function Minify() {
  shell.exec('npm run min');
}

function BuildDocs() {
  shell.exec('npm run doc');
}
