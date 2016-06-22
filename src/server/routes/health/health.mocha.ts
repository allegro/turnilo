import * as express from 'express';
import * as supertest from 'supertest';

import * as healthRouter from './health';

var app = express();

app.use('/', healthRouter);

describe('health router', () => {
  it('gets a 200', (testComplete) => {
    supertest(app)
      .get('/')
      .expect(200, testComplete);
  });

});
