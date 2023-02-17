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

import { Duration } from "chronoshift";
import { Response } from "express";
import { Expression } from "plywood";
import makeGridQuery from "../../../../client/visualizations/grid/make-query";
import { Logger } from "../../../../common/logger/logger";
import { Essence } from "../../../../common/models/essence/essence";
import { FixedTimeFilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { usedMeasures } from "../../../../common/models/series/used-measures";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import makeQuery from "../../../../common/utils/query/visualization-query";
import { executeQuery } from "../../../utils/query/execute-query";
import { QueryRouterRequest } from "../query";

function getQuery(essence: Essence, timekeeper: Timekeeper): Expression {
  return essence.visualization.name === "grid" ? makeGridQuery(essence, timekeeper) : makeQuery(essence, timekeeper);
}

function start(clause: FixedTimeFilterClause): string {
  return clause.values.first().start.toUTCString();
}

function intervalLength(clause: FixedTimeFilterClause): number {
  const timeRange = clause.values.first();
  return timeRange.end.getTime() - timeRange.start.getTime();
}

function timeVariables(essence: Essence, timekeeper: Timekeeper): Record<string, unknown> {
  const timeFilter = essence.currentTimeFilter(timekeeper);
  const timeDimension = essence.getTimeDimension();
  const timeSplit = essence.splits.findSplitForDimension(timeDimension);

  const startTime = start(timeFilter);
  const interval = intervalLength(timeFilter);

  const variables: Record<string, unknown> = { startTime, interval };

  if (timeSplit && timeSplit.bucket instanceof Duration) {
    variables.granularity = timeSplit.bucket.getDescription();
  }

  if (essence.hasComparison()) {
    const previousTimeFilter = essence.previousTimeFilter(timekeeper);
    variables.shiftedStartTime = start(previousTimeFilter);
  }

  return variables;
}

function logQueryInfo(essence: Essence, timekeeper: Timekeeper, logger: Logger) {
  const nonTimeFilters = essence.filter.removeClause(essence.getTimeDimension().name);

  logger.log(`Visualization query ${essence.description(timekeeper)}`, {
    ...timeVariables(essence, timekeeper),
    dataCube: essence.dataCube.name,
    visualization: essence.visualization.name,
    filters: nonTimeFilters.clauses.map(clause => clause.reference).toArray(),
    splits: essence.splits.splits.map(split => split.reference).toArray(),
    measures: essence.series.series.flatMap(usedMeasures).toSet().toArray()
  });
}

export default async function visualizationRoute({ context }: QueryRouterRequest, res: Response) {
  const { dataCube, essence, decorator, timekeeper, logger } = context;
  logQueryInfo(essence, timekeeper, logger);
  const query = getQuery(essence, timekeeper);
  const result = await executeQuery(dataCube, query, essence.timezone, decorator);
  res.json({ result });
}
