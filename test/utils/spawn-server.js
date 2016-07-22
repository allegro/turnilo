/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const spawn = require('child_process').spawn;
const extend = require('./extend');

function spawnServer(command, options) {
  if (!options) options = {};
  const verbose = Boolean(options.verbose);

  var args = command.split(/\s+/g);
  var cmd = args.shift();

  var env = process.env;
  if (options.env) {
    env = extend(env, options.env);
  }

  var stderr = '';
  var stdout = '';
  var stdall = '';
  var hookFired = false;
  var hookTexts = null;
  var hookFn = null;
  var child = spawn(cmd, args, {
    env: env
  });

  function maybeHook() {
    if (hookFired) return;
    if (hookTexts && hookFn && hookTexts.some((hookText) => stdall.indexOf(hookText) !== -1)) {
      hookFired = true;
      hookFn();
    }
  }

  child.stderr.on('data', (data) => {
    var dataStr = data.toString();
    if (verbose) console.log(`ERR: ${dataStr}`);
    stderr += dataStr;
    stdall += dataStr;
    maybeHook();
  });

  child.stdout.on('data', (data) => {
    var dataStr = data.toString();
    if (verbose) console.log(dataStr);
    stdout += dataStr;
    stdall += dataStr;
    maybeHook();
  });

  return {
    getStderr: function() { return stderr; },
    getStdout: function() { return stdout; },
    getStdall: function() { return stdall; },
    onHook: function(texts, fn) {
      hookTexts = Array.isArray(texts) ? texts : [texts];
      hookFn = fn;
    },
    kill: function() { child.kill('SIGHUP'); }
  };
}

module.exports = spawnServer;


