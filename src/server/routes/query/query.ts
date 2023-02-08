/*
 * Copyright 2017-2022 Allegro.pl
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
import { $, Expression, ply, SortExpression } from "plywood";
import makeGridQuery from "../../../client/visualizations/grid/make-query";
import { Dimension } from "../../../common/models/dimension/dimension";
import { findDimensionByName } from "../../../common/models/dimension/dimensions";
import { Essence } from "../../../common/models/essence/essence";
import { StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { LIMIT } from "../../../common/models/raw-data-modal/raw-data-modal";
import { Split } from "../../../common/models/split/split";
import { TimeShiftEnvType } from "../../../common/models/time-shift/time-shift-env";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { CANONICAL_LENGTH_ID } from "../../../common/utils/canonical-length/query";
import timeFilterCanonicalLength from "../../../common/utils/canonical-length/time-filter-canonical-length";
import { isNil } from "../../../common/utils/general/general";
import makeQuery from "../../../common/utils/query/visualization-query";
import { DEFAULT_VIEW_DEFINITION_VERSION, definitionConverters } from "../../../common/view-definitions";
import { createEssence } from "../../utils/essence/create-essence";
import { getQueryDecorator } from "../../utils/query-decorator-loader/get-query-decorator";
import { executeQuery } from "../../utils/query/execute-query";
import { handleRequestErrors } from "../../utils/request-errors/handle-request-errors";
import { parseDataCube } from "../../utils/request-params/parse-data-cube";
import { parseDimension } from "../../utils/request-params/parse-dimension";
import {
  parseOptionalStringFilterClause,
  parseStringFilterClause
} from "../../utils/request-params/parse-filter-clause";
import { parseSplit } from "../../utils/request-params/parse-split";
import { parseViewDefinition } from "../../utils/request-params/parse-view-definition";
import { SettingsManager } from "../../utils/settings-manager/settings-manager";

const converter = definitionConverters[DEFAULT_VIEW_DEFINITION_VERSION];

export function queryRouter(settings: Pick<SettingsManager, "logger" | "getSources" | "appSettings" | "anchorPath" | "getTimekeeper">) {

  const router = Router();

  router.post("/visualization", async (req: Request, res: Response) => {

    function getQuery(essence: Essence, timekeeper: Timekeeper): Expression {
      return essence.visualization.name === "grid" ? makeGridQuery(essence, timekeeper) : makeQuery(essence, timekeeper);
    }

    try {
      const dataCube = await parseDataCube(req, settings);
      const viewDefinition = parseViewDefinition(req);

      const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);

      const query = getQuery(essence, settings.getTimekeeper());
      const queryDecorator = getQueryDecorator(req, dataCube, settings);
      const result = await executeQuery(dataCube, query, essence.timezone, queryDecorator);
      res.json({ result });
    } catch (error) {
      handleRequestErrors(error, res, settings.logger);
    }
  });

  router.post("/raw-data", async (req: Request, res: Response) => {
    function getQuery(essence: Essence, timekeeper: Timekeeper): Expression {
      const { dataCube } = essence;
      const $main = $("main");
      const filterExpression = essence
        .getEffectiveFilter(timekeeper)
        .toExpression(dataCube);
      return $main.filter(filterExpression).limit(LIMIT);
    }

    try {
      const dataCube = await parseDataCube(req, settings);
      const viewDefinition = parseViewDefinition(req);

      const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);

      const query = getQuery(essence, settings.getTimekeeper());
      const queryDecorator = getQueryDecorator(req, dataCube, settings);
      const result = await executeQuery(dataCube, query, essence.timezone, queryDecorator);
      res.json({ result });
    } catch (error) {
      handleRequestErrors(error, res, settings.logger);
    }
  });

  router.post("/boolean-filter", async (req: Request, res: Response) => {
    function getQuery(essence: Essence, dimension: Dimension, timekeeper: Timekeeper): Expression {
      const { dataCube } = essence;
      const filterExpression = essence
        .getEffectiveFilter(timekeeper, { unfilterDimension: dimension })
        .toExpression(dataCube);

      return $("main")
        .filter(filterExpression)
        .split(dimension.expression, dimension.name);
    }

    try {
      const dataCube = await parseDataCube(req, settings);
      const viewDefinition = parseViewDefinition(req);
      const dimension = parseDimension(req, dataCube);

      const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);

      const query = getQuery(essence, dimension, settings.getTimekeeper());
      const queryDecorator = getQueryDecorator(req, dataCube, settings);
      const result = await executeQuery(dataCube, query, essence.timezone, queryDecorator);
      res.json({ result });
    } catch (error) {
      handleRequestErrors(error, res, settings.logger);
    }
  });

  router.post("/string-filter", async (req: Request, res: Response) => {

    // TODO: expose for UI
    const TOP_N = 100;

    function getQuery(essence: Essence, clause: StringFilterClause, timekeeper: Timekeeper): Expression {
      const { dataCube } = essence;
      const { reference: dimensionName } = clause;

      const $main = $("main");
      const dimension = findDimensionByName(dataCube.dimensions, dimensionName);
      const nativeCount = findDimensionByName(dataCube.dimensions, "count");
      const measureExpression = nativeCount ? nativeCount.expression : $main.count();

      const filter = essence
        .changeFilter(essence.filter.setClause(clause))
        .getEffectiveFilter(timekeeper).toExpression(dataCube);

      return $main
        .filter(filter)
        .split(dimension.expression, dimension.name)
        .apply("MEASURE", measureExpression)
        .sort($("MEASURE"), SortExpression.DESCENDING)
        .limit(TOP_N);
    }

    try {
      const dataCube = await parseDataCube(req, settings);
      const viewDefinition = parseViewDefinition(req);
      const clause = parseStringFilterClause(req, dataCube);

      const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);

      const query = getQuery(essence, clause, settings.getTimekeeper());
      const queryDecorator = getQueryDecorator(req, dataCube, settings);
      const result = await executeQuery(dataCube, query, essence.timezone, queryDecorator);
      res.json({ result });
    } catch (error) {
      handleRequestErrors(error, res, settings.logger);
    }
  });

  router.post("/number-filter", async (req: Request, res: Response) => {

    function getQuery(essence: Essence, dimension: Dimension, timekeeper: Timekeeper): Expression {
      const { dataCube } = essence;
      const filterExpression = essence
        .getEffectiveFilter(timekeeper, { unfilterDimension: dimension })
        .toExpression(dataCube);
      const $main = $("main");
      return ply()
        .apply("main", $main.filter(filterExpression))
        .apply("Min", $main.min($(dimension.name)))
        .apply("Max", $main.max($(dimension.name)));
    }

    try {
      const dataCube = await parseDataCube(req, settings);
      const viewDefinition = parseViewDefinition(req);
      const dimension = parseDimension(req, dataCube);

      const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);

      const query = getQuery(essence, dimension, settings.getTimekeeper());
      const queryDecorator = getQueryDecorator(req, dataCube, settings);
      const result = await executeQuery(dataCube, query, essence.timezone, queryDecorator);
      res.json({ result });
    } catch (error) {
      handleRequestErrors(error, res, settings.logger);
    }
  });

  router.post("/pinboard", async (req: Request, res: Response) => {

    function getQuery(essence: Essence, clause: StringFilterClause | null, split: Split, timekeeper: Timekeeper): Expression {
      const { dataCube } = essence;

      const dimension = findDimensionByName(dataCube.dimensions, split.reference);
      const sortSeries = essence.findConcreteSeries(split.sort.reference);
      const canonicalLength = timeFilterCanonicalLength(essence, timekeeper);

      const filter = essence
        .changeFilter(isNil(clause) ? essence.filter.removeClause(split.reference) : essence.filter.setClause(clause))
        .getEffectiveFilter(timekeeper)
        .toExpression(dataCube);

      return $("main")
        .filter(filter)
        .split(dimension.expression, dimension.name)
        .apply(CANONICAL_LENGTH_ID, canonicalLength)
        .performAction(sortSeries.plywoodExpression(0, { type: TimeShiftEnvType.CURRENT }))
        .performAction(split.sort.toExpression())
        .limit(split.limit);
    }

    try {
      const dataCube = await parseDataCube(req, settings);
      const viewDefinition = parseViewDefinition(req);
      const clause = parseOptionalStringFilterClause(req, dataCube);
      const split = parseSplit(req, dataCube);

      const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);

      const query = getQuery(essence, clause, split, settings.getTimekeeper());
      const queryDecorator = getQueryDecorator(req, dataCube, settings);
      const result = await executeQuery(dataCube, query, essence.timezone, queryDecorator);
      res.json({ result });

    } catch (error) {
      handleRequestErrors(error, res, settings.logger);
    }
  });

  return router;
}
