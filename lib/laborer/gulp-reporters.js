'use strict';

var fs = require('graceful-fs');
var gutil = require('gulp-util');
var through = require('through2');

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

exports.writeErrors = function(path, errorLines) {
  var data;
  if (errorLines.length) {
    data = errorLines.join('\n') + '\nTotal: ' + errorLines.length + ' error' + (errorLines.length > 1 ? 's' : '');
  } else {
    data = '';
  }
  try {
    fs.writeFileSync(path, data, 'utf8');
  } catch (e) {
    console.log('Could not write errors because:', e.message);
  }
};

exports.tscLintReporterFactory = function(opt) {
  var errorTexts = opt.errorTexts;
  var fixPath = opt.fixPath || String;

  return function(failures, file) {
    failures.forEach(function (failure) {
      // line + 1 because TSLint's first line and character is 0
      var errorText = fixPath(file.path) +
        '(' + (failure.startPosition.line + 1) + ',' + (failure.startPosition.character + 1) + '): ' +
        failure.ruleName + ': ' + failure.failure;

      errorTexts.push(errorText);
      console.error(gutil.colors.red(errorText));
    });
  }
};

exports.tscReporterFactory = function(opt) {
  var errorTexts = opt.errorTexts;
  var fixPath = opt.fixPath || String;
  var onFinish = opt.onFinish;

  return {
    error: function(error) {
      if (error.tsFile) {
        var errorText = fixPath(error.fullFilename) + '(' + error.startPosition.line + ',' + error.startPosition.character + '): error TS' + error.diagnostic.code + ' ' + flattenDiagnosticsVerbose(error.diagnostic.messageText);
        errorTexts.push(errorText);
        console.error(gutil.colors.red(errorText));
      } else {
        console.error(error.message);
      }
    },
    finish: function(results) {
      if (onFinish) onFinish();
    }
  }
};

exports.sassLintReporterFactory = function(opt) {
  var errorTexts = opt.errorTexts;

  var compile = through.obj(function (file, encoding, cb) {
    if (file.isNull()) {
      return cb();
    }
    if (file.isStream()) {
      this.emit('error', new Error('Streams are not supported!'));
      return cb();
    }

    var result = file.sassLint[0];

    if (result.messages.length) {
      result.messages.forEach(function (message) {
        var linter = message.ruleId ? (message.ruleId + ': ') : '';
        var logMsg = file.path + '(' + message.line + ',' + message.column + '): ' + linter + message.message;

        errorTexts.push(logMsg);
        console.error(gutil.colors.red(logMsg));
      });
    }

    this.push(file);
    cb();
  });
  return compile;
};

exports.sassErrorFactory = function(opt) {
  var errorTexts = opt.errorTexts;

  return function(error) {
    var message = error.message.replace(/\n\s\s/, '(').replace(/(\d+):(\d+)/, '$1,$2):');
    errorTexts.push(message);
    console.error(gutil.colors.red(message));
    this.emit('end');
  }
};
