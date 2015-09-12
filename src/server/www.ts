'use strict';

import * as debugModule from 'debug';
import * as http from 'http';

import * as app from './app';
import { PORT } from './config';

var debug = debugModule('pivot:www');

/**
 * Get port from environment and store in Express.
 */

app.set('port', PORT);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);
server.listen(PORT);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error('Port ' + PORT + ' requires elevated privileges');
      process.exit(1);
      break;

    case 'EADDRINUSE':
      console.error('Port ' + PORT + ' is already in use');
      process.exit(1);
      break;

    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var address = server.address();
  console.log('Listening on http://localhost:' + address.port);
  debug('Listening on ' + address.port);
}
