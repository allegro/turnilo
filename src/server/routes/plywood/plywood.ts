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

import { Router, Request, Response } from 'express';
import { $, Expression, RefExpression, External, Datum, Dataset, PlywoodValue, TimeRange, basicExecutorFactory, Executor, AttributeJSs } from 'plywood';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { PivotRequest } from '../../utils/index';

var router = Router();

router.post('/', (req: PivotRequest, res: Response) => {
  var { dataCube, dataSource, expression, timezone, settingsVersion } = req.body;
  dataCube = dataCube || dataSource; // back compat

  if (typeof dataCube !== 'string') {
    res.status(400).send({
      error: 'must have a dataCube'
    });
    return;
  }

  var queryTimezone: Timezone = null;
  if (typeof timezone === 'string') {
    try {
      queryTimezone = Timezone.fromJS(timezone);
    } catch (e) {
      res.status(400).send({
        error: 'bad timezone',
        message: e.message
      });
      return;
    }
  }

  var ex: Expression = null;
  try {
    ex = Expression.fromJS(expression);
  } catch (e) {
    res.status(400).send({
      error: 'bad expression',
      message: e.message
    });
    return;
  }

  req.getSettings(dataCube) // later: , settingsVersion)
    .then((appSettings) => {
      // var settingsBehind = false;
      // if (appSettings.getVersion() < settingsVersion) {
      //   settingsBehind = true;
      // }

      var myDataCube = appSettings.getDataCube(dataCube);
      if (!myDataCube) {
        res.status(400).send({ error: 'unknown data cube' });
        return null;
      }

      if (!myDataCube.executor) {
        res.status(400).send({ error: 'un queryable data cube' });
        return null;
      }

      return myDataCube.executor(ex, { timezone: queryTimezone }).then(
        (data: PlywoodValue) => {
          var reply: any = {
            result: Dataset.isDataset(data) ? data.toJS() : data
          };
          //if (settingsBehind) reply.action = 'update';
          res.json(reply);
        },
        (e: Error) => {
          console.log('error:', e.message);
          if (e.hasOwnProperty('stack')) {
            console.log((<any>e).stack);
          }
          res.status(500).send({
            error: 'could not compute',
            message: e.message
          });
        }
      );
    })
    .done();

});

export = router;
