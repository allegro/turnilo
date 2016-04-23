'use strict';

var gulp = require('gulp');
var watch = require('gulp-watch');
var runSequence = require('run-sequence');

var laborer = require('laborer');

gulp.task('style', laborer.taskStyle());
gulp.task('icons', laborer.taskIcons());

gulp.task('client:tsc', laborer.taskClientTypeScript({ declaration: true }));
gulp.task('server:tsc', laborer.taskServerTypeScript({ declaration: true }));

gulp.task('client:test', laborer.taskClientTest());
gulp.task('server:test', laborer.taskServerTest());

gulp.task('client:bundle', laborer.taskClientPack());

gulp.task('clean', laborer.taskClean());

gulp.task('all', function(cb) {
  laborer.failOnError();
  runSequence(
    'clean' ,
    ['style', 'icons'],
    ['server:tsc', 'client:tsc'],
    'client:bundle',
    cb
  );
});

gulp.task('stats', function(cb) {
  laborer.showStats();
  gulp.start('all');
});

gulp.task('all-minus-bundle', function(cb) {
  runSequence(
    'clean' ,
    ['style', 'icons'],
    ['server:tsc', 'client:tsc'],
    cb
  );
});

gulp.task('watch', ['all-minus-bundle'], function() {
  watch('./src/client/**/*.scss', function() {
    gulp.start('style');
  });

  watch('./src/client/**/*.svg', function() {
    gulp.start('icons');
  });

  watch(['./src/common/**/*.ts', './src/client/**/*.{ts,tsx}', './assets/icons/**'], function() {
    runSequence('client:tsc');
  });

  watch(['./src/common/**/*.ts', './src/server/**'], function() {
    gulp.start('server:tsc');
  });

  laborer.clientPackWatch()
});

gulp.task('default', ['all']);
