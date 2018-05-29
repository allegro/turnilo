/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import { Response, Router } from "express";
import { $, Dataset, Expression, RefExpression } from "plywood";
import { SwivRequest } from "../../utils/index";
import { GetSettingsOptions } from "../../utils/settings-manager/settings-manager";

var router = Router();

interface PlyqlOutputFunctions {
  [key: string]: (data: Dataset) => string;

  json: (data: Dataset) => string;
  csv: (data: Dataset) => string;
  tsv: (data: Dataset) => string;
}

var outputFunctions: PlyqlOutputFunctions = {
  json: (data: Dataset): string => JSON.stringify(data, null, 2),
  csv: (data: Dataset): string => data.toCSV(),
  tsv: (data: Dataset): string => data.toTSV()
};

router.post("/", (req: SwivRequest, res: Response) => {
  var { outputType, query } = req.body;

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

  parsedQuery = parsedQuery.substitute(ex => {
    if (ex instanceof RefExpression && ex.name === dataCube) {
      return $("main");
    }
    return null;
  });

  req.getSettings(<GetSettingsOptions> { dataCubeOfInterest: dataCube })
    .then((appSettings: any) => {
      var myDataCube = appSettings.getDataCube(dataCube);

      if (!myDataCube) {
        res.status(400).send({ error: "unknown data cube" });
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
