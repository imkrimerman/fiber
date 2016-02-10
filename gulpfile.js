'use strict';
var gulp = require('gulp')
  , inject = require('gulp-inject')
  , fs = require('fs')
  , path = require('path')
  , shell = require('shelljs')
  , mocha = require('gulp-mocha')
  , eslint = require('gulp-eslint')
  , connect = require('gulp-connect')
  , karma = require('karma')

  , config = {
    input: './fiber.js',
    output: './build',
    test: 'test/*.spec.js',
    karma: {
      configFile: __dirname + '/karma.conf.js'
    },
    files: [
      './src/fn.js',
      './src/Extensions.js',
      './src/Extensions/Access.js',
      './src/Extensions/Extendable.js',
      './src/Extensions/Mixin.js',
      './src/Extensions/NsEvents.js',
      './src/Extensions/OwnProperties.js',
      './src/BaseClass.js',
      './src/Model.js',
      './src/Collection.js',
      './src/LinkedViews.js',
      './src/Listeners.js',
      './src/View.js',
      './src/CollectionView.js'
    ]
  };

gulp.task('default', ['compile', 'injectTest', 'serve', 'lint', 'watch']);
gulp.task('compile', ['build', 'minify']);
gulp.task('build', Build);
gulp.task('minify', Minify);
gulp.task('watch', Watch);
gulp.task('injectTest', InjectTest);
gulp.task('karma', Karma(true));
gulp.task('tdd', Karma(false));
gulp.task('lint', Lint);
gulp.task('serve', Serve);
gulp.task('serverReload', Reload);

function Build() {
  gulp.src(config.input)
    .pipe(inject(gulp.src(config.files, {read: false}), {
      removeTags: true,
      transform: function(filepath) {
        if (filepath.slice(-3) === '.js') {
          var contents = fs.readFileSync(path.join(__dirname, filepath)).toString().split("\n");
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

function Watch() {
  gulp.watch(config.files, ['lint']);
  gulp.watch(config.files.concat([config.test]), ['compile']);
  gulp.watch(config.files.concat([config.test]), ['serverReload']);
}

function Minify() {
  shell.exec('npm run min');
}

function InjectTest() {
  gulp.src('./test/runner.html')
    .pipe(inject(gulp.src(config.test, {read: false}), {
      relative: true,
      addPrefix: '.'
    }))
    .pipe(gulp.dest('./test'))
    .pipe(connect.reload());
}

function Karma(tdd) {
  return function(done) {
    config.karma.singleRun = tdd;
    new karma.Server(config.karma, done).start();
  };
}

function Lint() {
  gulp.src(config.files)
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint({
      configFile: './.eslintrc'
    }))
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());
}

function Serve() {
  connect.server({
    root: './',
    port: 3030,
    livereload: true,
  });
  shell.exec('open -a "Google Chrome" http://localhost:3030/test/runner.html');
}

function Reload() {
  gulp.src(config.test.concat([config.output + '/*.js']))
    .pipe(connect.reload());
}
