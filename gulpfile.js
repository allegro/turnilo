'use strict';

var fs = require('fs');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var scsslint = require('gulp-scss-lint');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var typescript = require('gulp-typescript');
var replace = require('gulp-replace');
var concat = require('gulp-concat');
var tslint = require('gulp-tslint');
var cache = require("gulp-cache-money")({
  cacheFile: __dirname + "/.tsc-cache"
});

var merge = require('merge-stream');
var debug = require('gulp-debug');
var reactTools = require('react-tools');
var del = require('del');
var browserSync = require('browser-sync');

var mocha = require('gulp-mocha');

function writeErrors(path, errorLines) {
  var data;
  if (errorLines.length) {
    data = errorLines.join('\n') + '\nTotal: ' + errorLines.length + ' error' + (errorLines.length > 1 ? 's' : '');
  } else {
    data = '';
  }
  fs.writeFileSync(path, data, 'utf8');
}

gulp.task('style', function() {
  var errorTexts = [];
  function lintReporter(file, stream) {
    if (!file.scsslint.success) {
      file.scsslint.issues.forEach(function (issue) {
        var linter = issue.linter ? (issue.linter + ': ') : '';
        var logMsg = file.path + '(' + issue.line + ',0): ' + linter + issue.reason;

        errorTexts.push(logMsg);
        console.error(gutil.colors.red(logMsg));
      });
    }
  }

  function sassError(error) {
    var message = error.message.replace(/\n\s\s/, '(').replace(/(\d+):(\d+)/, '$1,$2):');
    errorTexts.push(message);
    console.error(gutil.colors.red(message));
    this.emit('end');
  }

  return gulp.src('./src/**/*.scss')
    .pipe(scsslint({
      config: 'sass-lint.yml',
      customReport: lintReporter
    }))
    .pipe(sass().on('error', sassError))
    .pipe(postcss([
      autoprefixer({
        browsers: ['> 1%', 'last 3 versions', 'Firefox ESR', 'Opera 12.1'],
        remove: false // If you have no legacy code, this option will make Autoprefixer about 10% faster.
      })
    ]))
    .pipe(concat('explorer.css'))
    .pipe(gulp.dest('./bundle'))
    .on('finish', function() {
      writeErrors('./webstorm/style-errors', errorTexts);
    });
});

// TypeScript ------------------------------------------

function flattenDiagnosticsVerbose(message, index) {
  if (index == null) index = 0;
  if (typeof message === 'undefined') {
    return '';
  } else if (typeof message === 'string') {
    return message;
  } else {
    var result;
    if (index === 0) {
      result = message.messageText;
    } else {
      result = '\n> TS' + message.code + ' ' + message.messageText;
    }
    return result + flattenDiagnosticsVerbose(message.next, index + 1);
  }
}

gulp.task('tsc', function() {
  var errorTexts = [];

  function tscLintReporter(failures, file) {
    failures.forEach(function(failure) {
      // line + 1 because TSLint's first line and character is 0
      var errorText = file.path.replace('/tmp/', '/src/') +
        '(' + (failure.startPosition.line + 1) + ',' + (failure.startPosition.character + 1) + '): ' +
        failure.ruleName + ': ' + failure.failure;

      errorTexts.push(errorText);
      console.error(gutil.colors.red(errorText));
    });
  }

  function tscReporter() {
    return {
      error: function(error) {
        if (error.tsFile) {
          var errorText = error.fullFilename.replace('/tmp/', '/src/') + '(' + error.startPosition.line + ',' + error.startPosition.character + '): error TS' + error.diagnostic.code + ' ' + flattenDiagnosticsVerbose(error.diagnostic.messageText);
          errorTexts.push(errorText);
          console.error(gutil.colors.red(errorText));
        } else {
          console.error(error.message);
        }
      },
      finish: function(results) {
        writeErrors('./webstorm/tsc-errors', errorTexts);
      }
    }
  }

  var sourceFiles = gulp.src(['./src/**/*.ts'])
    //.pipe(cache().on("cache-report", function(hits) {
    //  gutil.log(gutil.colors.magenta(hits.length), "cache hits");
    //}))
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
    .pipe(gulp.dest('./tmp/')) // typescript requires actual files on disk, not just in memory
    .pipe(tslint()) // Re-enable tslint when TS 1.5 is supported
    .pipe(tslint.report(tscLintReporter, { emitError: false }));

  var typeFiles = gulp.src(['./typings/**/*.d.ts']);

  return merge(sourceFiles, typeFiles)
    .pipe(typescript({
      typescript: require('typescript'),
      noImplicitAny: true,
      noEmitOnError: true,
      module: 'commonjs'
    }, undefined, tscReporter())) // typescript.reporter.longReporter()))
    //.pipe(debug({title: 'compiled:'}))
    .pipe(gulp.dest('./build/'));
});

// ----------------------------------------------------------------

gulp.task('test', function() {
  return gulp.src('./build/**/*.mocha.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('bundle', ['tsc'], function() {
  // From: https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md
  var b = browserify({
    entries: './build/main.js'
  });

  return b.bundle()
    .pipe(source('explorer.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./bundle/'));
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
    './tmp/**',
    './.tsc-cache'
  ], cb);
});

gulp.task('all', ['style', 'tsc', 'bundle']);

gulp.task('watch', function() {
  gulp.watch('./src/**', ['style', 'tsc', 'bundle']);
  gulp.watch('./icons/**', ['bundle']);
});
