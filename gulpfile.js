'use strict';
var gulp = require('gulp')
  , inject = require('gulp-inject')
  , babel = require('gulp-babel')
  , mocha = require('gulp-mocha')
  , eslint = require('gulp-eslint')
  , connect = require('gulp-connect')
  , gulpNotify = require('gulp-notify')
  , flow = require('flow-bin')

  , fs = require('fs')
  , path = require('path')
  , shell = require('shelljs')
  , karma = require('karma')

  , config = {
    src: 'src',
    tmp: 'tmp',
    input: 'fiber.js',
    output: 'build',
    outputFile: 'build/fiber.js',
    test: 'test/**/*.spec.js',
    testDir: 'test',
    karma: {
      configFile: __dirname + '/karma.conf.js'
    },
    files: [
      './src/Base/fn.js',
      './src/Support/Class.js',
      './src/Support/String.js',
      './src/Support/Template.js',
      './src/Support/Validation.js',

      './src/Base/Extensions.js',
      './src/Extensions/Access.js',
      './src/Extensions/Extend.js',
      './src/Extensions/Mixin.js',
      './src/Extensions/NsEvents.js',
      './src/Extensions/OwnProperties.js',

      './src/Base/Class.js',
      './src/Base/Bag.js',
      './src/Base/ErrorBag.js',
      './src/Model.js',
      './src/Collection.js',
      './src/Base/LinkedViews.js',
      './src/Base/Listeners.js',
      './src/Base/Ioc.js',
      './src/View.js',
      './src/CollectionView.js',
    ]
  };



gulp.task('default', ['build', 'uglify']);
gulp.task('dev', ['build', 'watch']);
gulp.task('template', ['template-code', 'template-test']);
gulp.task('flow', ['flow-check', 'flow-remove']);

gulp.task('build', function() {
  shell.exec('gulp template && gulp flow');
});

gulp.task('watch', function() {
  gulp.watch(config.files.concat(config.input), ['build']);
});

gulp.task('flow-remove', function FlowRemove() {
  return gulp.src(config.tmp + '/fiber.js')
    .pipe(babel({
      plugins: ["transform-flow-strip-types"]
    }))
    .pipe(gulp.dest(config.output));
});

gulp.task('flow-check', function FlowCheck() {
  var log = shell.exec('flow check --debug').stdout;
  if (log !== 'Found 0 errors') log = 'Found Errors!'
  notify('Flow check: ' + log);
});

gulp.task('template-code', function Template() {
  return gulp.src(config.input)
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
    .pipe(gulp.dest(config.tmp))
    .pipe(connect.reload());
});


gulp.task('template-test', function TemplateTest() {
  return gulp.src(config.testDir + '/runner.html')
    .pipe(inject(gulp.src(config.test, {read: false}), {
      relative: true,
      addPrefix: '.'
    }))
    .pipe(gulp.dest(config.testDir))
    .pipe(connect.reload());
});


gulp.task('lint', function Lint() {
  return gulp.src(config.files)
    .pipe(eslint({
      configFile: './.eslintrc'
    }))
    .pipe(eslint.format());
});


gulp.task('serve', function Serve() {
  return connect.server({
    root: './',
    port: 3030,
    livereload: true,
  });
});


gulp.task('uglify', function Minify() {
  return shell.exec('npm run min');
});


gulp.task('docs', function BuildDocs() {
  return shell.exec('npm run doc');
});


gulp.task('karma', CreateKarmaServer(true));
gulp.task('tdd', CreateKarmaServer(false));

function CreateKarmaServer(tdd) {
  return function(done) {
    config.karma.singleRun = tdd;
    new karma.Server(config.karma, done).start();
  };
}

function notify(message) {
  return gulp.src(config.input, {read: false}).pipe(
    gulpNotify({
      title: 'Fiber Framework',
      message: message,
      icon: path.join(__dirname, 'notify.png'),
    })
  );
}
