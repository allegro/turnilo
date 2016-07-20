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

import * as debugModule from 'debug';
import * as http from 'http';

import * as app from './app';
import { START_SERVER, SERVER_SETTINGS } from './config';

if (START_SERVER) {
  var debug = debugModule('pivot:www');
  var server = http.createServer(app);

  server.on('error', (error: any) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${SERVER_SETTINGS.port} requires elevated privileges`);
        process.exit(1);
        break;

      case 'EADDRINUSE':
        console.error(`Port ${SERVER_SETTINGS.port} is already in use`);
        process.exit(1);
        break;

      default:
        throw error;
    }
  });

  server.on('listening', () => {
    var address = server.address();
    console.log(`Pivot is listening on address ${address.address} port ${address.port}`);
    debug(`Pivot is listening on address ${address.address} port ${address.port}`);
  });

  app.set('port', SERVER_SETTINGS.port);
  server.listen(SERVER_SETTINGS.port, SERVER_SETTINGS.getServerHost());
}
