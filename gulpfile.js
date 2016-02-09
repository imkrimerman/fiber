'use strict';
var gulp = require('gulp')
  , inject = require('gulp-inject')
  , fs = require('fs')
  , path = require('path')
  , shell = require('shelljs')

  , config = {
    input: './fiber.js',
    output: './build',
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


gulp.task('default', ['build', 'watch']);
gulp.task('build', Build);
gulp.task('watch', Watch);
gulp.task('test', Test);


function Build() {
  gulp.src(config.input)
    .pipe(inject(gulp.src(config.files, {read: false}), {
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
    }, {removeTags: true})).pipe(gulp.dest(config.output));
}

function Watch() {
  gulp.watch(config.files, ['build']);
  gulp.watch(config.files.concat(['test/*.spec.js']), ['test']);
}


function Test() {
  shell.exec('npm run test');
}
