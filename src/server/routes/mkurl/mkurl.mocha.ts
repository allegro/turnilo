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
import { SwivRequest } from '../../utils/index';
import { GetSettingsOptions } from '../../utils/settings-manager/settings-manager';

import { AppSettingsMock } from '../../../common/models/app-settings/app-settings.mock';

import * as mkurlRouter from './mkurl';

var app = express();

app.use(bodyParser.json());

var appSettings: AppSettings = AppSettingsMock.wikiOnlyWithExecutor();
app.use((req: SwivRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = '0.9.4';
  req.getSettings = (dataCubeOfInterest?: GetSettingsOptions) => Q(appSettings);
  next();
});

app.use('/', mkurlRouter);

describe('mkurl router', () => {
  it('gets a simple url back', (testComplete:any) => {
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

  it('gets a complex url back', (testComplete:any) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        domain: 'http://localhost:9090',
        dataCube: 'wiki',
        essence: {
          visualization: 'totals',
          timezone: 'Etc/UTC',
          filter: $('time').overlap(new Date('2015-01-01Z'), new Date('2016-01-01Z')).toJS(),
          pinnedDimensions: [],
          singleMeasure: 'count',
          selectedMeasures: ["count", "added"],
          splits: []
        }
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        url: "http://localhost:9090#wiki/totals/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5MBuApgE4A2AhjsplqRQHYAme62ewJRAZisAxQC" +
        "2RDmACWw4AF8aRAB5YuAZyViMDVrQ5kxYemT4EKZAK4jc6JWAokwHAEwAGAIwBWALQvPzuI8e4/AMcAOj9HAC0+ImYHFwA2b29ff0C/UL9Im" +
        "WAwAE86DjgASQBZEAB9ACUAQQA5AHEQaRkAbQBdZAYTMjIaCAwTBjtkZuA+gaHgCiYmIhZ2to6usiA==="
      }, testComplete);
  });

  it('gets a url filtered on article name back', (testComplete:any) => {
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
        url: "http://localhost:9090#wiki/totals/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5MBuApgE4A2AhjsplqRQHYAme62ewJRAZisAxQC" +
        "2RDhRJgAlhDJEAckJEBfGkQAeWLgGdNEjA1a0OZCWHpk+BCmQCuI3Ok1EwcAJ50OAZTgAlAJKyAcT4iGWEGME08AG1gMUlpIgBGPjipGQAmY" +
        "ABdZWAwNztgDxA4YEVlKKzkBmsyMhoIDGtwlBjG5rAUpiYiFirK6tqyIA"
      }, testComplete);
  });

  it('gets a url filtered on match back', (testComplete:any) => {
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
                "op": "sort",
                "expression": {
                  "op": "ref",
                  "name": "count"
                },
                "direction": "descending"
              },
              "limitAction": {
                "op": "limit",
                "size": 50
              }
            }
          ]
        }
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        url: "http://localhost:9090#wiki/table/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gC2AhpABYqZYCmATkQHYAme62ewNVAZhfUQVXZY" +
        "iAc0EBfZBypiAHjnwA9AHQAqAEIYwagCTBJAbXRV5nAM5mAlhnotK7Tjyl8BQ0RKlmMNMAEEIYNa2uKwKwF4+FCZY5lY2dmz4jrz8gvgQGAC" +
        "u9GD6UoyWnAFB7IxUZhBUTJb0InnAADaWBJZ+xfEh9vhNLblSAG5EDZlp9JkNDeLiALrIYxNSGdl9BsBLORREjGXMswaz8w1AA=="
      }, testComplete);
  });

  it('gets a url filtered on contains', (testComplete:any) => {
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
                "op": "sort",
                "expression": {
                  "op": "ref",
                  "name": "count"
                },
                "direction": "descending"
              },
              "limitAction": {
                "op": "limit",
                "size": 50
              }
            }
          ]
        }
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        url: "http://localhost:9090#wiki/table/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQYB2YAhgJZEDOKmWApgE6lEAme62ewj9AZrSKk" +
        "AtvW5ZSAczEBfZMHoAPLLypVyxDnW4AbcmCakdtAG5GArmPwBlFsDkEMwib25EMjYUfvIA2uiUVejUNIi0ufF4BeSFRcSlZeSoPMABBCDBQ8" +
        "Jx8ZMYwWkDVdU1cThyefkERK0dzEh9gVnJeDKz8VmCIejZKSUa9YX10zNLy3XIhgvkzHUs8InMdHRkZAF1kReX5Qnrp3zqG+VJWTvYN3w2tn" +
        "SA=="
      }, testComplete);
  });

  it('gets a url filtered on set contains', (testComplete:any) => {
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
                "op": "sort",
                "expression": {
                  "op": "ref",
                  "name": "count"
                },
                "direction": "descending"
              },
              "limitAction": {
                "op": "limit",
                "size": 50
              }
            }
          ]
        }
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        url: "http://localhost:9090#wiki/table/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQYB2YAhgJZEDOKmWApgE6lEAme62ewj9AZrSKk" +
        "AtvW4BXKkwQALUoxoBfZMHoAPLLypVyxDnW4AbcmCalDtAG7nxY/EmUEMwrPLvAiGRsPPBlAbXR1TXptXSJ9LnxeARUhUW5XAHMxRyovMABB" +
        "CDBwyJx8dMYwWmCtHT1cTgKefkERd0JxEj8VVnJeHLz8VlCIejZKJNbgY2ETbNzK6qNycZKVa0NbPCJxQ0NFRQBdZDWNlSaW5H8nZoXgUlZe" +
        "9l3/Xf3DIA=="
      }, testComplete);
  });

  it('gets a url with split on time back', (testComplete:any) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        domain: 'http://localhost:9090',
        dataSource: 'wiki', // back compat
        essence: {
          visualization: 'totals',
          timezone: 'Etc/UTC',
          filter: $('time').overlap(new Date('2015-01-01Z'), new Date('2016-01-01Z')).toJS(),
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
                "op": "timeBucket",
                "duration": "PT1H"
              },
              "sortAction": {
                "op": "sort",
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
        url: "http://localhost:9090#wiki/totals/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5MBuApgE4A2AhjsplqRQHYAme62ewJRAZisAxQC" +
        "2RDmACWw4AF8aRAB5YuAZyViMDVrQ5kxYemT4EKZAK4jc6JWAokwHAEwAGAIwBWALQvPzuI8e4/AMcAOj9HAC0+ImYHFwA2b29ff0C/UL9Im" +
        "WAwAE86DjgASQBZEAB9ACUAQQA5AHEQaRkAbQBdZAYTMjIaCAwTBjtkZuA+gaHgCiYmIhZ2to6usiA==="
      }, testComplete);
  });
});
