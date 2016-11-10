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

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

function eventCollector(options, callback) {
  var port = options.port || 28090;

  var app = express();
  app.disable('x-powered-by');

  app.use(bodyParser.json());

  var events = [];
  app.post('/', (req, res) => {
    if (!Array.isArray(req.body)) {
      res.status(400).json({ error: 'body must be an array '});
      return;
    }

    events = events.concat(req.body);
    res.json({ status: 'ok' });
  });

  var server = http.createServer(app);

  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    callback(error);
  });

  server.on('listening', () => {
    callback(null, port);
  });

  app.set('port', port);
  server.listen(port);

  return {
    kill: function() {
      server.close();
    },
    getEvents: function() {
      return events;
    }
  };
}

module.exports = eventCollector;
