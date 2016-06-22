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
  server.listen(SERVER_SETTINGS.port, SERVER_SETTINGS.serverHost);
}
