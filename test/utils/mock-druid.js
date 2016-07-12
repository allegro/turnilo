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

var Q = require('q');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

function mockDruid(port, options) {
  var version = options.version || '0.9.1';

  var app = express();
  app.disable('x-powered-by');

  app.get('/status', (req, res) => {
    if (options.onStatus) {
      Q(options.onStatus()).then(function(r) {
        res.status(r.status || 200).json(r.json);
      });
    } else {
      res.json({
        version
      });
    }
  });

  app.get('/druid/v2/datasources', (req, res) => {
    if (options.onDataSources) {
      Q(options.onDataSources(req.body)).then(function(r) {
        res.status(r.status || 200).json(r.json);
      });
    } else {
      throw new Error('should not GET /druid/v2/datasources');
    }
  });

  app.use(bodyParser.json());

  app.post('/druid/v2/', (req, res) => {
    if (options.onQuery) {
      Q(options.onQuery(req.body)).then(function(r) {
        res.status(r.status || 200).json(r.json);
      });
    } else {
      throw new Error('should not POST /druid/v2/');
    }
  });

  var server = http.createServer(app);

  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${port} requires elevated privileges`);
        process.exit(1);
        break;

      case 'EADDRINUSE':
        console.error(`Port ${port} is already in use`);
        process.exit(1);
        break;

      default:
        throw error;
    }
  });

  var deferred = Q.defer();

  server.on('listening', () => {
    deferred.resolve(null);
  });

  app.set('port', port);
  server.listen(port);

  return deferred.promise;
}

module.exports = mockDruid;
