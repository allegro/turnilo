'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');

var laborer = require('laborer');

gulp.task('style', laborer.taskStyle());
gulp.task('icons', laborer.taskIcons());

gulp.task('client:tsc', laborer.taskClientTypeScript({ dontCache: false, declaration: true, skipLibCheck: true, sourcemaps: true }));
gulp.task('server:tsc', laborer.taskServerTypeScript({ dontCache: false, declaration: true, skipLibCheck: true, sourcemaps: true }));

gulp.task('client:test', ['client:tsc'], laborer.taskClientTest({reporter: 'progress'}));
gulp.task('server:test', ['server:tsc'], laborer.taskServerTest({reporter: 'progress'}));
gulp.task('common:test', ['client:tsc'], laborer.taskCommonTest({reporter: 'progress'}));

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
  gulp.watch('./src/client/**/*.scss', ['style']);
  gulp.watch('./src/client/**/*.svg', ['icons']);

  if (process.env['NO_GULP_WATCH_TEST']) {
    gulp.watch(['./src/common/**/*.ts', './src/client/**/*.{ts,tsx}', './assets/icons/**'], ['client:tsc']);
  } else {
    gulp.watch(['./src/common/**/*.ts', './src/client/**/*.{ts,tsx}', './assets/icons/**'], function() {
      runSequence('client:tsc');
    });
  }

  gulp.watch(['./src/common/**/*.ts', './src/server/**'], ['server:tsc']);

  if (!process.env['NO_GULP_WATCH_PACK']) {
    laborer.clientPackWatch()
  }
});

gulp.task('default', ['all']);
