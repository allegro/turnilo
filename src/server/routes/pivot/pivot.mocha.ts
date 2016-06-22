import { expect } from 'chai';
import * as Q from 'q';
import * as express from 'express';
import { Response } from 'express';
import * as supertest from 'supertest';

import { AppSettings } from '../../../common/models/index';
import { PivotRequest } from '../../utils/index';

import { AppSettingsMock } from '../../../common/models/app-settings/app-settings.mock';

import * as pivotRouter from './pivot';

var app = express();

var appSettings: AppSettings = AppSettingsMock.wikiOnlyWithExecutor();
app.use((req: PivotRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = '0.9.4';
  req.getSettings = (dataSourceOfInterest?: string) => Q(appSettings);
  next();
});

app.use('/', pivotRouter);

describe('pivot router', () => {
  it('does a query (value)', (testComplete) => {
    supertest(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) testComplete(err);
        expect(res.text).to.contain('<!DOCTYPE html>');
        expect(res.text).to.contain('<meta name="description" content="Data Explorer">');
        testComplete();
      });
  });

});
