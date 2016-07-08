import { expect } from 'chai';
import * as express from 'express';
import * as supertest from 'supertest';
import * as bodyParser from 'body-parser';

import * as errorRouter from './error';

var app = express();

app.use(bodyParser.json());

app.use('/', errorRouter);

var consoleErr = "";
console.error = function(t) {
  consoleErr += t;
};

describe('error route', () => {
  var errorObj = {
    message: "Uncaught TypeError: Cannot read property 'start' of null",
    file: "http://localhost:9090/pivot-main.9dcd61eb37d2c3c22868.js",
    line: 52026,
    column: 50,
    stack: "TypeError: Cannot read property 'start' of null\n    " +
    "at LineChart.floorRange (http://localhost:9090/pivot-main.9dcd61eb37d2c3c22868.js:52026:50)\n    " +
    "at LineChart.globalMouseUpListener (http://localhost:9090/pivot-main.9dcd61eb37d2c3c22868.js:52052:36)"
  };
  it('gets a 200', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send(errorObj)
      .expect(200)
      .end((err, res) => {
        expect(consoleErr).to.deep.equal('Client Error: ' + JSON.stringify(errorObj));
        testComplete();
      });
  });

  it('validates error has a message', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({ query: 'select things' })
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).to.deep.equal('Error must have a message');
        testComplete();
      });
  });

});
