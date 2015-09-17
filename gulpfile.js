'use strict';

var gulp = require('gulp');
var watch = require('gulp-watch');

var laborer = require('laborer');

gulp.task('style', laborer.taskStyle('pivot.css'));
gulp.task('client:tsc', laborer.taskClientTypeScript());
gulp.task('server:tsc', laborer.taskServerTypeScript());
gulp.task('client:test', laborer.taskClientTest());
gulp.task('server:test', laborer.taskServerTest());
gulp.task('client:bundle', ['client:tsc'], laborer.taskClientBundle());
gulp.task('clean', laborer.taskClean());

gulp.task('all', ['style', 'server:tsc', 'client:tsc', 'client:bundle']);

gulp.task('watch', ['all'], function() {
  watch('./src/client/**/*.scss', function() {
    gulp.start('style');
  });

  watch(['./src/client/**/*.ts', './assets/icons/**'], function() {
    gulp.start('client:bundle');
  });

  watch('./src/server/**', function() {
    gulp.start('server:tsc');
  });
});
