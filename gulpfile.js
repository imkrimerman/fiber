'use strict';
var gulp = require('gulp')
  , inject = require('gulp-inject')
  , fs = require('fs')
  , path = require('path')
  , shell = require('shelljs')
  , mocha = require('gulp-mocha')
  , eslint = require('gulp-eslint')

  , config = {
    input: './fiber.js',
    output: './build',
    test: 'test/*.spec.js',
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

gulp.task('default', ['compileTest', 'lint', 'watch']);
gulp.task('compile', ['build', 'minify']);
gulp.task('compileTest', ['compile', 'test']);
gulp.task('build', Build);
gulp.task('minify', Minify);
gulp.task('watch', Watch);
gulp.task('test', InjectTest);
gulp.task('lint', Lint);

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
    .pipe(gulp.dest(config.output));
}

function Watch() {
  gulp.watch(config.files, ['compile']);
  gulp.watch(config.files, ['lint']);
  gulp.watch(config.files.concat(['test/*.spec.js']), ['compileTest']);
}

function Minify() {
  shell.exec('npm run min');
}

function Test() {
  gulp.src(config.test, {read: false})
    .pipe(mocha({
      ui: 'bdd',
      reporter: 'spec'
    }))
    .once('error', function(data) {
        console.log('Error in test: ' + data.message);
    });
}

function InjectTest() {
  gulp.src('./test/runner.html')
    .pipe(inject(gulp.src(config.test, {read: false}), {
      relative: true,
      addPrefix: '.'
    }))
    .pipe(gulp.dest('./test'));
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
