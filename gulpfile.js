'use strict';

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var scsslint = require('gulp-scss-lint');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var tsc = require('gulp-typescript');
var replace = require('gulp-replace');
var concat = require('gulp-concat');
var tslint = require('gulp-tslint');

var merge = require('merge-stream');
var debug = require('gulp-debug');
var reactTools = require('react-tools');
var del = require('del');
var typescript = require('typescript');
var browserSync = require('browser-sync');

var mocha = require('gulp-mocha');

var gr = require('./gulp-reporters');

// client -> client_build_tmp -> client_build -> public
// server -> build

gulp.task('style', function() {
  var errorTexts = [];

  return gulp.src('./client/**/*.scss')
    .pipe(scsslint({
      config: 'sass-lint.yml',
      customReport: gr.sassLintReporterFactory({
        errorTexts: errorTexts
      })
    }))
    .pipe(sass().on('error', gr.sassErrorFactory({
      errorTexts: errorTexts
    })))
    .pipe(postcss([
      autoprefixer({
        browsers: ['> 1%', 'last 3 versions', 'Firefox ESR', 'Opera 12.1'],
        remove: false // If you have no legacy code, this option will make Autoprefixer about 10% faster.
      })
    ]))
    .pipe(concat('explorer.css'))
    .pipe(gulp.dest('./public'))
    .on('finish', function() {
      gr.writeErrors('./webstorm/style-errors', errorTexts);
    });
});

// TypeScript ------------------------------------------

gulp.task('client:tsc', function() {
  var errorTexts = [];

  function fixPath(str) {
    return str.replace('/client_build_tmp/', '/client/');
  }

  var sourceFiles = gulp.src(['./client/**/*.ts'])
    .pipe(replace(/JSX\((`([^`]*)`)\)/gm, function (match, fullMatch, stringContents) {
      var transformed;
      try {
        transformed = reactTools.transform(stringContents);
        transformed = transformed.replace(/\s+\n/g, '\n'); // Trim trailing whitespace
      } catch (e) {
        return '["' + e.message + '"]';
      }
      if (transformed.split('\n').length !== stringContents.split('\n').length) {
        throw new Error('transformed line count does not match');
      }
      if (transformed[0] === '\n') {
        transformed = '(' + transformed + ')';
      }
      return transformed;
    }))
    .pipe(gulp.dest('./client_build_tmp/')) // typescript requires actual files on disk, not just in memory
    .pipe(tslint())
    .pipe(tslint.report(
      gr.tscLintReporterFactory({
        errorTexts: errorTexts,
        fixPath: fixPath
      }),
      { emitError: false }
    ));

  var typeFiles = gulp.src(['./typings/**/*.d.ts']);

  return merge(sourceFiles, typeFiles)
    .pipe(tsc(
      {
        typescript: typescript,
        noImplicitAny: true,
        noEmitOnError: true,
        target: 'ES5',
        module: 'commonjs'
      },
      undefined,
      gr.tscReporterFactory({
        errorTexts: errorTexts,
        fixPath: fixPath,
        onFinish: function() { gr.writeErrors('./webstorm/tsc-client-errors', errorTexts); }
      })
    ))
    .pipe(gulp.dest('./client_build/'));
});

gulp.task('server:tsc', function() {
  var errorTexts = [];

  var sourceFiles = gulp.src(['./server/**/*.ts'])
    .pipe(tslint())
    .pipe(tslint.report(
      gr.tscLintReporterFactory({
        errorTexts: errorTexts
      }),
      { emitError: false }
    ));

  var typeFiles = gulp.src(['./typings/**/*.d.ts']);

  return merge(sourceFiles, typeFiles)
    .pipe(tsc(
      {
        typescript: typescript,
        noImplicitAny: true,
        noEmitOnError: true,
        target: 'ES5',
        module: 'commonjs'
      },
      undefined,
      gr.tscReporterFactory({
        errorTexts: errorTexts,
        onFinish: function() { gr.writeErrors('./webstorm/tsc-server-errors', errorTexts); }
      })
    ))
    .pipe(gulp.dest('./build/'));
});

// ----------------------------------------------------------------

gulp.task('client:test', function() {
  return gulp.src('./client_build/**/*.mocha.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('bundle', ['client:tsc'], function() {
  // From: https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md
  var b = browserify({
    entries: './client_build/main.js'
  });

  return b.bundle()
    .pipe(source('explorer.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./public/'));
});

gulp.task('browser-sync', function() {
  // browser-sync start --server --files "bundle/*,index.html"
  browserSync({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('clean', function(cb) {
  del([
    './build/**',
    './client_build/**',
    './client_build_tmp/**',
    './.tsc-cache'
  ], cb);
});

gulp.task('all', ['style', 'server:tsc', 'client:tsc', 'bundle']);

gulp.task('watch', ['all'], function() {
  gulp.watch('./client/**', ['style', 'client:tsc', 'bundle']);
  gulp.watch('./server/**', ['server:tsc']);
  gulp.watch('./icons/**', ['bundle']);
});
