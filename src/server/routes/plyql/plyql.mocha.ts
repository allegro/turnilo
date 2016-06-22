import * as Q from 'q';
import * as express from 'express';
import { Response } from 'express';
import * as supertest from 'supertest';
import mime = require('mime');
import * as bodyParser from 'body-parser';

import { AppSettings } from '../../../common/models/index';
import { PivotRequest } from '../../utils/index';

import { AppSettingsMock } from '../../../common/models/app-settings/app-settings.mock';

import * as plyqlRouter from './plyql';

var app = express();

app.use(bodyParser.json());

var appSettings: AppSettings = AppSettingsMock.wikiOnlyWithExecutor();
app.use((req: PivotRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = '0.9.4';
  req.getSettings = (dataSourceOfInterest?: string) => Q(appSettings);
  next();
});

app.use('/', plyqlRouter);


var pageQuery = "SELECT SUM(added) as Added FROM `wiki` GROUP BY page ORDER BY Added DESC LIMIT 10;";
var timeQuery = "SELECT TIME_BUCKET(time, 'PT1H', 'Etc/UTC') as TimeByHour, SUM(added) as Added FROM `wiki` GROUP BY 1 ORDER BY TimeByHour ASC";

interface PlyQLTestQuery {
  outputType: string;
  query: string;
  testName: string;
}

var tests: PlyQLTestQuery[] = [
  {
    outputType: "json",
    query: pageQuery,
    testName: "POST json pages added"
  },
  {
    outputType: "json",
    query: timeQuery,
    testName: "POST json timeseries"
  },
  {
    outputType: "csv",
    query: pageQuery,
    testName: "POST csv pages added"
  },
  {
    outputType: "csv",
    query: timeQuery,
    testName: "POST csv timeseries"
  },
  {
    outputType: "tsv",
    query: pageQuery,
    testName: "POST tsv pages added"
  },
  {
    outputType: "tsv",
    query: timeQuery,
    testName: "POST tsv timeseries"
  }
];

function responseHandler(err: any, res: any) {
  console.log("Response Type: " + res.type);
  console.log("Response Text: " + res.text);
}

function testPlyqlHelper(testName: string, contentType: string, queryStr: string) {
  it(testName, (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send(queryStr)
      .expect('Content-Type', contentType + "; charset=utf-8")
      .expect(200, testComplete);
  });
}

describe('plyql router', () => {
  tests.forEach(function(test) {
    testPlyqlHelper(test.testName, mime.lookup(test.outputType), JSON.stringify(test, null, 2));
  });
});
