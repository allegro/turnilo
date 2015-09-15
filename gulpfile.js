'use strict';

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var path = require('path');

var gulp = require('gulp');
var sass = require('gulp-sass');
var scsslint = require('gulp-scss-lint');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var tsc = require('gulp-typescript');
var concat = require('gulp-concat');
var tslint = require('gulp-tslint');
var foreach = require('gulp-foreach');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');

var merge = require('merge-stream');
var debug = require('gulp-debug');
var del = require('del');
var typescript = require('typescript');

var mocha = require('gulp-mocha');

var tsLintConfig = require('./src/lint/tslint');
var gr = require('./gulp-reporters');

// client -> client_build_tmp -> client_build -> public
// server -> build

var STYLE_NAME = 'pivot.css';

gulp.task('style', function() {
  var errorTexts = [];

  return gulp.src('./src/client/**/*.scss')
    .pipe(scsslint({
      config: './src/lint/sass-lint.yml',
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
    .pipe(concat(STYLE_NAME))
    .pipe(gulp.dest('./build/public'))
    .on('finish', function() {
      gr.writeErrors('./webstorm/style-errors', errorTexts);
    });
});

// TypeScript ------------------------------------------

gulp.task('client:tsc', function() {
  var errorTexts = [];

  function fixPath(str) {
    return str.replace('/build/client_tmp/', '/src/client/');
  }

  var sourceFiles = gulp.src(['./src/client/**/*.ts'])
    .pipe(gr.jsxFixerFactory())
    .pipe(gulp.dest('./build/client_tmp/')) // typescript requires actual files on disk, not just in memory
    .pipe(tslint({
      configuration: tsLintConfig
    }))
    .pipe(tslint.report(
      gr.tscLintReporterFactory({
        errorTexts: errorTexts,
        fixPath: fixPath
      }),
      { emitError: false }
    ));

  var typeFiles = gulp.src(['./typings/**/*.d.ts']);

  return merge(sourceFiles, typeFiles)
    //.pipe(sourcemaps.init())
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
    //.pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '../client' }))
    .pipe(gulp.dest('./build/client/'));
});

gulp.task('server:tsc', function() {
  var errorTexts = [];

  var sourceFiles = gulp.src(['./src/server/**/*.ts'])
    .pipe(tslint({
      configuration: tsLintConfig
    }))
    .pipe(tslint.report(
      gr.tscLintReporterFactory({
        errorTexts: errorTexts
      }),
      { emitError: false }
    ));

  var typeFiles = gulp.src(['./typings/**/*.d.ts']);

  return merge(sourceFiles, typeFiles)
    .pipe(sourcemaps.init())
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
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: '../../src/server'
    }))
    .pipe(gulp.dest('./build/server'));
});

// ----------------------------------------------------------------

gulp.task('client:test', function() {
  return gulp.src('./build/client/**/*.mocha.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('server:test', function() {
  return gulp.src('./build/server/**/*.mocha.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('client:bundle', ['client:tsc'], function() {
  return gulp.src('./build/client/*.js')
    .pipe(foreach(function(stream, file) {
      // From: https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md
      var b = browserify({
        //debug: true,
        entries: file.path
      });

      return b.bundle()
        .pipe(source(path.basename(file.path)))
        .pipe(buffer());
    }))
    .pipe(gulp.dest('./build/public'));
});

gulp.task('clean', function(cb) {
  del(['./build/**'], cb);
});

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
