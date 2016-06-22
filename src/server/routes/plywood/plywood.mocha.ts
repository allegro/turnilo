import * as Q from 'q';
import * as express from 'express';
import { Response } from 'express';
import * as supertest from 'supertest';
import { $, ply, r } from 'plywood';
import * as bodyParser from 'body-parser';

import { AppSettings } from '../../../common/models/index';
import { PivotRequest } from '../../utils/index';

import { AppSettingsMock } from '../../../common/models/app-settings/app-settings.mock';

import * as plywoodRouter from './plywood';

var app = express();

app.use(bodyParser.json());

var appSettings: AppSettings = AppSettingsMock.wikiOnlyWithExecutor();
app.use((req: PivotRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = '0.9.4';
  req.getSettings = (dataSourceOfInterest?: string) => Q(appSettings);
  next();
});

app.use('/', plywoodRouter);

describe('plywood router', () => {
  it('version mismatch', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        version: '0.9.3',
        expression: $('main').toJS()
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(412)
      .expect({
        error: 'incorrect version',
        action: 'reload'
      }, testComplete);
  });

  it('must have dataSource', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        version: '0.9.4',
        expression: $('main').toJS()
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(400)
      .expect({
        "error": "must have a dataSource"
      }, testComplete);
  });

  it('does a query (value)', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        version: '0.9.4',
        expression: $('main').count().toJS(),
        dataSource: 'wiki'
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        result: 10
      }, testComplete);
  });

  it('does a query (dataset)', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        version: '0.9.4',
        expression: $('main')
          .split('$channel', 'Channel')
          .apply('Count', $('main').count())
          .sort('$Count', 'descending')
          .limit(2)
          .toJS(),
        dataSource: 'wiki'
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        result: [
          { Channel: 'en', Count: 4 },
          { Channel: 'vi', Count: 4 }
        ]
      }, testComplete);
  });

});
