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
  req.getSettings = (dataCubeOfInterest?: string) => Q(appSettings);
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
        dataCube: 'wiki',
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
        dataCube: 'wiki',
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

  it('gets a url filtered on article name back', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        domain: 'http://localhost:9090',
        dataCube: 'wiki',
        essence: {
          visualization: 'totals',
          timezone: 'Etc/UTC',
          filter: $('articleName').in(['article1', 'article2']).toJS(),
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
        "ALbVexBmFIQANtQByo8QF9kwYhGkc86Tds6YAbtQaziOdXUYs2Orphz5ZpMKeKyqRjwFdxD5mowOABPLH9gAGU4ACUASQUAcSpqeTFyMGY8AG0" +
        "NKRl5AEYqSWk5agAmYABdNWAwMIjIkDhgFXbkbOrkch9ZWXUIDB8MlFyhkbASgBNp6mmazu7e/qA="
      }, testComplete);
  });

  it('gets a url filtered on match back', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        domain: 'http://localhost:9090',
        dataCube: 'wiki',
        essence: {
          visualization: 'table',
          timezone: 'Etc/UTC',
          filter: $('page').match('^.*Bot.*$'),
          pinnedDimensions: [],
          singleMeasure: 'count',
          selectedMeasures: ["count", "added"],
          splits: [
            {
              "expression": {
                "op": "ref",
                "name": "page"
              },
              "sortAction": {
                "action": "sort",
                "expression": {
                  "op": "ref",
                  "name": "count"
                },
                "direction": "descending"
              },
              "limitAction": {
                "action": "limit",
                "limit": 50
              }
            }
          ]
        }
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        url: "http://localhost:9090#wiki/table/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQAWAhgJYB2KwApgB5YBO1Azs6RpbutnsEwGZVyxA" +
        "LbVeWYgHNxAX2TBiEMO07olKjrxHFIhKkxn1eAPQB0AKgBCGMJYAkwWfIDa6OoxZstXTDnwCQqLi+JIyTgrMGAxgAILKqnjqCT7AUTFUHkysib4" +
        "8AdSCCsJivBAYAK7kYBHAACakTCmc9SwQ1OQN5FK1ADakIqRxzUmKI/j9gzUKk0N4AKwADM4AusjkFb29CuVV0y4EldVUxHV11HXAay5rG1tAA="
      }, testComplete);
  });

  it('gets a url filtered on contains', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        domain: 'http://localhost:9090',
        dataCube: 'wiki',
        essence: {
          visualization: 'table',
          timezone: 'Etc/UTC',
          filter: $('page').contains('San'),
          pinnedDimensions: [],
          singleMeasure: 'count',
          selectedMeasures: ["count", "added"],
          splits: [
            {
              "expression": {
                "op": "ref",
                "name": "page"
              },
              "sortAction": {
                "action": "sort",
                "expression": {
                  "op": "ref",
                  "name": "count"
                },
                "direction": "descending"
              },
              "limitAction": {
                "action": "limit",
                "limit": 50
              }
            }
          ]
        }
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        url: "http://localhost:9090#wiki/table/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQAWAhgJYB2KwApgB5YBO1Azs6RpbutnsEwGZVyxAL" +
        "bVeWYgHNxAX2TBiEMO07olKjrwgcwZcsyp1GLNlq6Yc+ADakw1BsWtUAbk4Cu4/AGVileQQYIpJMvOQYDCJOwLLyANroxkysqnjcVnzUggrCYh" +
        "LScgrMEWAAgsqpFhqVwMUMYEb0yWZqlrwCQqJege7kDQEAJqRMFebAAywQ1ORD5FIxCrYiduWardVjS3ZUWw24AKwADLEAusjk7tbWCjq9Dchx" +
        "PX1UxAMTA8BncWcXV0A=="
      }, testComplete);
  });

  it('gets a url filtered on set contains', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        domain: 'http://localhost:9090',
        dataCube: 'wiki',
        essence: {
          visualization: 'table',
          timezone: 'Etc/UTC',
          filter: $('userChars').contains('C'),
          pinnedDimensions: [],
          singleMeasure: 'count',
          selectedMeasures: ["count", "added"],
          splits: [
            {
              "expression": {
                "op": "ref",
                "name": "page"
              },
              "sortAction": {
                "action": "sort",
                "expression": {
                  "op": "ref",
                  "name": "count"
                },
                "direction": "descending"
              },
              "limitAction": {
                "action": "limit",
                "limit": 50
              }
            }
          ]
        }
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        url: "http://localhost:9090#wiki/table/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQAWAhgJYB2KwApgB5YBO1Azs6RpbutnsEwGZVyxA" +
        "LbVeAV2bUGCEg2bAAvsmDEIYdp3TrNHXhA5gy5RarqMWbfV0w58AG1JgZxB1QBubiePxIVBBgiWMRMvOQYDCJuyioA2ugWTKxaeNz2fNSCqsJivCE" +
        "A5uIBzJFgAIIaqba61cClDGBUSVbV6bwCQqK+gRLkTQEAJqRMVTbAgywQ1OTD5AXKqk4izpV62mpjnMDLzlS7TbgArAAMSkoAusjkEg4OqoZ9T" +
        "chxvf1UxIOTg8BXcVc3O5AA"
      }, testComplete);
  });

  it('gets a url with split on time back', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        domain: 'http://localhost:9090',
        dataSource: 'wiki', // back compat
        essence: {
          visualization: 'totals',
          timezone: 'Etc/UTC',
          filter: $('time').in(new Date('2015-01-01Z'), new Date('2016-01-01Z')).toJS(),
          pinnedDimensions: [],
          singleMeasure: 'count',
          selectedMeasures: ["count", "added"],
          splits: [
            {
              "expression": {
                "op": "ref",
                "name": "__time"
              },
              "bucketAction": {
                "action": "timeBucket",
                "duration": "PT1H"
              },
              "sortAction": {
                "action": "sort",
                "expression": {
                  "op": "ref",
                  "name": "__time"
                },
                "direction": "ascending"
              }
            }
          ]
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
