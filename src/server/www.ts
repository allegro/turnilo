import * as debugModule from 'debug';
import * as http from 'http';

import * as app from './app';
import { START_SERVER, PORT } from './config';

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
        console.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;

      case 'EADDRINUSE':
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
        break;

      default:
        throw error;
    }
  });

  server.on('listening', () => {
    var address = server.address();
    console.log('Listening on ' + address.port);
    debug('Listening on ' + address.port);
  });

  app.set('port', PORT);
  server.listen(PORT);
}
