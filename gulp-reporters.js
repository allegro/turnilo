'use strict';

var fs = require('fs');
var gutil = require('gulp-util');

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
  fs.writeFileSync(path, data, 'utf8');
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

  return function(file, stream) {
    if (!file.scsslint.success) {
      file.scsslint.issues.forEach(function (issue) {
        var linter = issue.linter ? (issue.linter + ': ') : '';
        var logMsg = file.path + '(' + issue.line + ',0): ' + linter + issue.reason;

        errorTexts.push(logMsg);
        console.error(gutil.colors.red(logMsg));
      });
    }
  }
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
