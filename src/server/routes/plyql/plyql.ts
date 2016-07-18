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
import { $, Expression, ChainExpression, RefExpression, External, Datum, Dataset, TimeRange, ApplyAction } from 'plywood';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { PivotRequest } from '../../utils/index';

var router = Router();

interface PlyqlOutputFunctions {
  [key: string]: (data: Dataset) => string;
  json: (data: Dataset) => string;
  csv: (data: Dataset) => string;
  tsv: (data: Dataset) => string;
}

var outputFunctions: PlyqlOutputFunctions = {
  json: (data: Dataset): string => { return JSON.stringify(data, null, 2); },
  csv: (data: Dataset): string => { return data.toCSV(); },
  tsv: (data: Dataset): string => { return data.toTSV(); }
};

router.post('/', (req: PivotRequest, res: Response) => {
  var { version, outputType, query } = req.body;

  if (version && version !== req.version) {
    res.status(400).send({
      error: 'incorrect version',
      action: 'reload'
    });
    return;
  }

  if (typeof query !== "string") {
    var errmsg = "Query must be a string";
    res.status(400).send(errmsg);
    return;
  }

  try {
    var parsedSQL = Expression.parseSQL(query);
  } catch (e) {
    var errmsg = "Could not parse query as SQL: " + e.message;
    res.status(400).send(errmsg);
    return;
  }

  if (typeof outputType !== "string") {
    outputType = "json";
  }

  var outputFn: (data: Dataset) => string;
  outputFn = outputFunctions[outputType];
  if (outputFn === undefined) {
    var errmsg = "Invalid output type: " + outputType;
    res.status(400).send(errmsg);
    return;
  }

  var parsedQuery = parsedSQL.expression;
  var dataCube = parsedSQL.table;
  if (!dataCube) {
    var errmsg = "Could not determine data cube name";
    res.status(400).send(errmsg);
    return;
  }

  parsedQuery = parsedQuery.substitute((ex) => {
    if (ex instanceof RefExpression && ex.name === dataCube) {
      return $("main");
    }
    return null;
  });

  req.getSettings(dataCube)
    .then((appSettings) => {
      var myDataCube = appSettings.getDataCube(dataCube);

      if (!myDataCube) {
        res.status(400).send({ error: 'unknown data cube' });
        return;
      }

      myDataCube.executor(parsedQuery).then(
        (data: Dataset) => {
          res.type(outputType);
          res.send(outputFn(Dataset.fromJS(data.toJS())));
        },
        (error: Error) => {
          res.status(500).send(`got error ${error.message}`);
        }
      );
    })
    .done();

});

export = router;
