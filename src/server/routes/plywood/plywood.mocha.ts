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

import * as plywoodRouter from './plywood';

var app = express();

app.use(bodyParser.json());

var appSettings: AppSettings = AppSettingsMock.wikiOnlyWithExecutor();
app.use((req: PivotRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = '0.9.4';
  req.stateful = false;
  req.getSettings = (dataCubeOfInterest?: string) => Q(appSettings);
  next();
});

app.use('/', plywoodRouter);

describe('plywood router', () => {
  it('must have dataCube', (testComplete) => {
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
        "error": "must have a dataCube"
      }, testComplete);
  });

  it('does a query (value)', (testComplete) => {
    supertest(app)
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        version: '0.9.4',
        expression: $('main').count().toJS(),
        dataCube: 'wiki'
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
        dataSource: 'wiki' // back compat
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
