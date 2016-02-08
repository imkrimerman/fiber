'use strict';
var gulp = require('gulp')
  , inject = require('gulp-inject')
  , fs = require('fs')
  , path = require('path');


gulp.task('build', function() {
  gulp.src('./index.js')
    .pipe(inject(
      gulp.src(['./src/*.js'], {read: false}), {
        transform: function (filepath) {
          if (filepath.slice(-3) === '.js') {
            return fs.readFileSync(path.join(__dirname, filepath)).toString();
          }
          // Use the default transform as fallback:
          return inject.transform.apply(inject.transform, arguments);
        }
      }
    ))
    .pipe(gulp.dest('./dist'));
});
