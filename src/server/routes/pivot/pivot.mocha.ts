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

import { expect } from 'chai';
import * as Q from 'q';
import * as express from 'express';
import * as supertest from 'supertest';
import { Response } from 'supertest';

import { AppSettings } from '../../../common/models/index';
import { PivotRequest } from '../../utils/index';

import { AppSettingsMock } from '../../../common/models/app-settings/app-settings.mock';

import * as pivotRouter from './pivot';

var app = express();

var appSettings: AppSettings = AppSettingsMock.wikiOnlyWithExecutor();
app.use((req: PivotRequest, res: express.Response, next: Function) => {
  req.user = null;
  req.version = '0.9.4';
  req.getSettings = (dataCubeOfInterest?: string) => Q(appSettings);
  next();
});

app.use('/', pivotRouter);

describe('pivot router', () => {
  it('does a query (value)', (testComplete) => {
    supertest(app)
      .get('/')
      .expect(200)
      .end((err: any, res: Response) => {
        if (err) testComplete(err);
        expect(res.text).to.contain('<!DOCTYPE html>');
        expect(res.text).to.contain('<meta name="description" content="Data Explorer">');
        testComplete();
      });
  });

});
