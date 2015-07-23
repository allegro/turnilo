#!/usr/bin/env node
'use strict';

var startTime = new Date();
startTime.setMilliseconds(0); // Round to the start of the second (since m.time is rounded down)

var fs = require('fs');

if (process.argv.length !== 3) {
  console.log('incorrect number of arguments');
  process.exit(1);
}

var path = './webstorm/' + process.argv[2];
function getStat() {
  try {
    return fs.statSync(path);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return null;
    } else {
      throw e;
    }
  }
}

var tries = 0;
function tryFile() {
  var stat = getStat();
  if (stat && startTime <= stat.mtime) {
    if (stat.size > 4) {
      // There were errors, spit them out
      console.log(fs.readFileSync(path, 'utf8'));
      process.exit(1);
    } else {
      // All clean
      console.log('OK');
      process.exit(0);
    }
  }

  // Retry
  tries++;
  if (tries < 40) {
    setTimeout(tryFile, 250);
  } else {
    console.log('timeout. make sure that gulp watch is running');
    if (stat) {
      console.log('file was found but time stamp did not match');
      console.log('My start time: ' + startTime.toISOString());
      console.log('File m.time:   ' + stat.mtime.toISOString());
    } else {
      console.log('file was never found');
    }
    process.exit(1);
  }
}
tryFile();
