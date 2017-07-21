'use strict';

var fs = require('graceful-fs');
var path = require('path');

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var autoprefixer = require('autoprefixer');

var merge = require('merge-stream');
var del = require('del');
var typescript = require('typescript');


var tsLintConfig = require('./tslint-rules');
var sassLintRules = require('./sasslint-rules');
var gr = require('./gulp-reporters');

var webpack = require("webpack");

function identity(x) { return x }


// Modifiers ==============

var globalShowStats = false;

exports.showStats = function() {
  globalShowStats = true;
};

exports.hideStats = function() {
  globalShowStats = false;
};


var globalFailOnError = false;

exports.failOnError = function() {
  globalFailOnError = true;
};


// TASKS ==============

exports.taskStyle = function(opt) {
  opt = opt || {};
  var rules = opt.rules || sassLintRules;

  $.sass.compiler = require('node-sass');

  return function() {
    var errorTexts = [];

    return gulp.src('./src/client/**/*.scss')
      .pipe($.sassLint({ rules: rules }))
      .pipe(gr.sassLintReporterFactory({ errorTexts: errorTexts }))
      .pipe($.sass({
        outputStyle: 'compressed'
      }).on('error', gr.sassErrorFactory({
        errorTexts: errorTexts
      })))
      .pipe($.postcss([
        autoprefixer({
          browsers: ['> 1%', 'last 3 versions', 'Firefox ESR', 'Opera 12.1'],
          remove: false // If you have no legacy code, this option will make Autoprefixer about 10% faster.
        })
      ]))
      .pipe(gulp.dest('./build/client'))
      .on('finish', function() {
        gr.writeErrors('./webstorm/errors', errorTexts);
        if (globalFailOnError && errorTexts.length) process.exit(1);
      });
  };
};


exports.taskIcons = function() {
  return function() {
    return gulp.src('./src/client/**/*.svg')
      // Just copy for now
      .pipe(gulp.dest('./build/client'))
  };
};


exports.taskHtml = function() {
  return function() {
    return gulp.src('./src/client/**/*.html')
      // Just copy for now
      .pipe(gulp.dest('./build/client'))
  };
};


exports.taskClientTypeScript = function(opt) {
  opt = opt || {};
  var dontCache = opt.dontCache || false;
  var declaration = opt.declaration || false;
  var strictNullChecks = opt.strictNullChecks || false;
  var skipLibCheck = opt.skipLibCheck || false;
  var tsLintConfigHook = opt.tsLintConfigHook || identity;

  var tsProject = $.typescript.createProject({
    typescript: typescript,
    noImplicitAny: true,
    noFallthroughCasesInSwitch: true,
    noImplicitReturns: true,
    noEmitOnError: true,
    removeComments: true,
    strictNullChecks: strictNullChecks,
    skipLibCheck: skipLibCheck,
    target: 'ES5',
    module: 'commonjs',
    moduleResolution: 'node',
    declaration: declaration,
    jsx: 'react'
  });

  return function() {
    var errorTexts = [];

    function fixPath(str) {
      return str.replace('/build/tmp/', '/src/');
    }

    var sourceFiles = gulp.src(['./src/{client,common}/**/*.{ts,tsx}']);
    if (!dontCache) sourceFiles = sourceFiles.pipe($.cached('client'));
    sourceFiles = sourceFiles
      .pipe($.tslint({configuration: tsLintConfigHook(tsLintConfig)}))
      .pipe($.tslint.report(
        gr.tscLintReporterFactory({
          errorTexts: errorTexts,
          fixPath: fixPath
        }),
        { emitError: false }
      ));

    var typeFiles = gulp.src(['./typings/**/*.d.ts']);

    var compiled = merge(sourceFiles, typeFiles)
      .pipe($.typescript(
        tsProject,
        undefined,
        gr.tscReporterFactory({
          errorTexts: errorTexts,
          fixPath: fixPath,
          onFinish: function() {
            gr.writeErrors('./webstorm/errors', errorTexts);
            if (globalFailOnError && errorTexts.length) process.exit(1);
          }
        })
      ));

    if (declaration) {
      return merge([
        compiled.dts.pipe(gulp.dest('./build')),
        compiled.js.pipe(gulp.dest('./build'))
      ])
    } else {
      return compiled.pipe(gulp.dest('./build'));
    }
  };
};


exports.taskServerTypeScript = function(opt) {
  opt = opt || {};
  var dontCache = opt.dontCache || false;
  var declaration = opt.declaration || false;
  var strictNullChecks = opt.strictNullChecks || false;
  var skipLibCheck = opt.skipLibCheck || false;
  var tsLintConfigHook = opt.tsLintConfigHook || identity;

  var tsProject = $.typescript.createProject({
    typescript: typescript,
    noImplicitAny: true,
    noFallthroughCasesInSwitch: true,
    noImplicitReturns: true,
    noEmitOnError: true,
    removeComments: true,
    strictNullChecks: strictNullChecks,
    skipLibCheck: skipLibCheck,
    target: 'ES5',
    module: 'commonjs',
    moduleResolution: 'node',
    declaration: declaration
  });

  return function() {
    var errorTexts = [];

    var sourceFiles = gulp.src(['./src/{server,common}/**/*.ts']);
    if (!dontCache) sourceFiles = sourceFiles.pipe($.cached('server'));
    sourceFiles = sourceFiles
      .pipe($.tslint({configuration: tsLintConfigHook(tsLintConfig)}))
      .pipe($.tslint.report(
        gr.tscLintReporterFactory({
          errorTexts: errorTexts
        }),
        { emitError: false }
      ));

    var typeFiles = gulp.src(['./typings/**/*.d.ts']);

    var compiled = merge(sourceFiles, typeFiles)
      .pipe($.typescript(
        tsProject,
        undefined,
        gr.tscReporterFactory({
          errorTexts: errorTexts,
          onFinish: function() {
            gr.writeErrors('./webstorm/errors', errorTexts);
            if (globalFailOnError && errorTexts.length) process.exit(1);
          }
        })
      ));

    if (declaration) {
      return merge([
        compiled.dts.pipe(gulp.dest('./build')),
        compiled.js.pipe(gulp.dest('./build'))
      ])
    } else {
      return compiled.pipe(gulp.dest('./build'));
    }
  };
};


var generateTester = function(path, parameters) {
  return function() {
    return gulp.src(path, {read: false})
      // gulp-mocha needs filepaths so you can't have any plugins before it
      .pipe($.mocha(parameters));
  };
};

exports.taskCommonTest = function(parameters) {
  return generateTester('./build/common/**/*.mocha.js', parameters);
};

exports.taskClientTest = function(parameters) {
  return generateTester('./build/client/**/*.mocha.js', parameters);
};

exports.taskServerTest = function(parameters) {
  return generateTester('./build/server/**/*.mocha.js', parameters);
};


function webpackCompilerFactory(opt) {
  opt = opt || {};
  var cwd = process.cwd();
  var files = fs.readdirSync(path.join(cwd, '/build/client'));

  var entryFiles = files.filter(function(file) { return /-entry\.js$/.test(file) });
  if (!entryFiles.length) return null;

  var entry = {};
  entryFiles.forEach(function(entryFile) {
    entry[entryFile.substr(0, entryFile.length - 9)] = './build/client/' + entryFile;
  });

  //{
  //  pivot: './build/client/pivot-entry.js'
  //}

  return webpack({
    context: cwd,
    entry: entry,
    target: opt.target || 'web',
    output: {
      path: path.join(cwd, "/build/public"),
      filename: "[name].js",
      chunkFilename: "[name].[hash].js"
    },
    resolveLoader: {
      root: path.join(__dirname, "node_modules")
    },
    module: {
      loaders: [
        { test: /\.svg$/, loaders: ['raw-loader', 'svgo-loader?useConfig=svgoConfig1'] },
        { test: /\.css$/, loaders: ['style-loader', 'css-loader'] },
        { test: /\.json$/, loaders: ['json-loader'] }
      ]
    },
    svgoConfig1: {
      plugins: [
        // https://github.com/svg/svgo
        { removeTitle: true },
        { removeDimensions: true },
        { convertColors: { shorthex: false } },
        { convertPathData: false }
      ]
    }
  });
}


function webpackResultHandler(showStats, err, stats) {
  var errorTexts = [];
  if (err) {
    errorTexts.push('Fatal webpack error: ' + err.message);
  } else {
    var jsonStats = stats.toJson();

    if(jsonStats.errors.length > 0 || jsonStats.warnings.length > 0) {
      errorTexts = jsonStats.errors.concat(jsonStats.warnings);
    }

    if (showStats || globalShowStats) {
      $.util.log("[webpack]", stats.toString({
        colors: true
      }));
    }
  }

  if (errorTexts.length) console.error(errorTexts.join('\n'));
  gr.writeErrors('./webstorm/errors', errorTexts);
  if (globalFailOnError && errorTexts.length) process.exit(1);
}

exports.taskClientPack = function(opt) {
  opt = opt || {};
  var showStats = opt.showStats;
  return function(callback) {
    var webpackCompiler = webpackCompilerFactory(opt);
    if (!webpackCompiler) return callback();
    webpackCompiler.run(function(err, stats) {
      webpackResultHandler(showStats, err, stats);
      callback();
    });
  };
};


exports.clientPackWatch = function(opt) {
  opt = opt || {};
  var showStats = opt.showStats;
  var webpackCompiler = webpackCompilerFactory(opt);
  if (!webpackCompiler) throw new Error('no entry files found');
  webpackCompiler.watch({ // watch options:
    aggregateTimeout: 300 // wait so long for more changes
    //poll: true // use polling instead of native watchers
  }, function(err, stats) {
    webpackResultHandler(showStats, err, stats);
    $.util.log("[webpack]", 'done');
  });
};


exports.taskClean = function() {
  return function() {
    del.sync(['./build/**'])
  }
};
