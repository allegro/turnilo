/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { Request, Response, Router } from "express";
import { $, Dataset, Expression, RefExpression } from "plywood";
import { isQueryable } from "../../../common/models/data-cube/queryable-data-cube";
import { getDataCube } from "../../../common/models/sources/sources";
import { SettingsManager } from "../../utils/settings-manager/settings-manager";

interface PlyqlOutputFunctions {
  [key: string]: (data: Dataset) => string;

  json: (data: Dataset) => string;
  csv: (data: Dataset) => string;
  tsv: (data: Dataset) => string;
}

const outputFunctions: PlyqlOutputFunctions = {
  json: (data: Dataset): string => JSON.stringify(data, null, 2),
  csv: (data: Dataset): string => data.toCSV(),
  tsv: (data: Dataset): string => data.toTSV()
};

export function plyqlRouter(settings: Pick<SettingsManager, "getSources">) {

  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    const { query } = req.body;
    let { outputType } = req.body;

    if (typeof query !== "string") {
      res.status(400).send("Query must be a string");
      return;
    }

    let parsedSQL;
    try {
      parsedSQL = Expression.parseSQL(query);
    } catch (e) {
      res.status(400).send(`Could not parse query as SQL: ${e.message}`);
      return;
    }

    if (typeof outputType !== "string") {
      outputType = "json";
    }

    const outputFn = outputFunctions[outputType];
    if (outputFn === undefined) {
      res.status(400).send("Invalid output type");
      return;
    }

    let parsedQuery = parsedSQL.expression;
    const dataCube = parsedSQL.table;
    if (!dataCube) {
      res.status(400).send("Could not determine data cube name");
      return;
    }

    parsedQuery = parsedQuery.substitute(ex => {
      if (ex instanceof RefExpression && ex.name === dataCube) {
        return $("main");
      }
      return null;
    });

    try {
      const sources = await settings.getSources();
      const myDataCube = getDataCube(sources, dataCube);

      if (!myDataCube) {
        res.status(400).send({ error: "unknown data cube" });
        return;
      }

      if (!isQueryable(myDataCube)) {
        res.status(400).send({ error: "un queryable data cube" });
        return;
      }

      const data: Dataset = await myDataCube.executor(parsedQuery) as Dataset;
      res.type(outputType);
      res.send(outputFn(Dataset.fromJS(data.toJS())));
    } catch (error) {
      res.status(500).send(`got error ${error.message}`);
    }
  });

  return router;
}
