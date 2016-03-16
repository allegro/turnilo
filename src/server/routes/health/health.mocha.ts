import * as supertest from 'supertest';

import * as app from '../../app';

describe('GET /health', () => {
  it('respond with 200', (done) => {
    supertest(app)
      .get('/health')
      .expect(200, done);
  });
});

