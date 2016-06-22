import * as Q from 'q';
import * as express from 'express';
import { Response } from 'express';
import * as supertest from 'supertest';
import { $, ply, r } from 'plywood';
import * as bodyParser from 'body-parser';

import { AppSettings } from '../../../common/models/index';
import { PivotRequest } from '../../utils/index';

import { AppSettingsMock } from '../../../common/models/app-settings/app-settings.mock';

import * as mkurlRouter from './mkurl';

var app = express();

app.use(bodyParser.json());

var appSettings: AppSettings = AppSettingsMock.wikiOnlyWithExecutor();
app.use((req: PivotRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = '0.9.4';
  req.getSettings = (dataSourceOfInterest?: string) => Q(appSettings);
  next();
});

app.use('/', mkurlRouter);

describe('mkurl router', () => {
  it('gets a simple url back', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        domain: 'http://localhost:9090',
        dataSource: 'wiki',
        essence: {
          visualization: 'totals',
          timezone: 'Etc/UTC',
          filter: {
            op: "literal",
            value: true
          },
          pinnedDimensions: [],
          singleMeasure: 'count',
          selectedMeasures: [],
          splits: []
        }
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        url: "http://localhost:9090#wiki/totals/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gA2AlmAKYBOAhgSsAG7UCupeY5zAvsgNoC6yAO0YECyYBAyMBYFHx78hIoA"
      }, testComplete);
  });

  it('gets a complex url back', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        domain: 'http://localhost:9090',
        dataSource: 'wiki',
        essence: {
          visualization: 'totals',
          timezone: 'Etc/UTC',
          filter: $('time').in(new Date('2015-01-01Z'), new Date('2016-01-01Z')).toJS(),
          pinnedDimensions: [],
          singleMeasure: 'count',
          selectedMeasures: ["count", "added"],
          splits: []
        }
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        url: "http://localhost:9090#wiki/totals/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQAWAhgJYB2KwApgB5YBO1Azs6RpbutnsEwGZVyx" +
        "ALbVeYUmOABfZMGIRJHPOkXLOwClTqMWbFV0w58AG1JhqDYqaoA3GwFdxR5mGIMwvAEwAGAIwArAC0AaH+cL6+uFExvgB0Ub4AWjrkACY+AQBs" +
        "4eGR0bFRiVGpcsBgAJ5YLsBwAJIAsiAA+gBKAIIAcgDiILIycgDaALrI5I6mpvIQGI7kXshDBHMLVMTp6dSZY6Pjk6ZAA"
      }, testComplete);
  });

});
