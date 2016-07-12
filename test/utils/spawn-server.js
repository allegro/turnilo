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


