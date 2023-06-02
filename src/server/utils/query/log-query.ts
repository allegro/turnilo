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
import { Logger } from "../../../common/logger/logger";
import { getMaxTime } from "../../../common/models/data-cube/data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { FixedTimeFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { usedMeasures } from "../../../common/models/series/used-measures";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";

function start(clause: FixedTimeFilterClause): Date {
  return clause.values.first().start;
}

function intervalLength(start: Date, end: Date): number {
  return end.getTime() - start.getTime();
}

function clauseInterval(clause: FixedTimeFilterClause): number {
  const { end, start } = clause.values.first();
  return intervalLength(start, end);
}

function timeVariables(essence: Essence, timekeeper: Timekeeper): Record<string, unknown> {
  const maxTime = getMaxTime(essence.dataCube, timekeeper);
  const timeFilter = essence.currentTimeFilter(timekeeper);
  const timeDimension = essence.getTimeDimension();
  const timeSplit = essence.splits.findSplitForDimension(timeDimension);

  const startTime = start(timeFilter);
  const interval = clauseInterval(timeFilter);

  const variables: Record<string, unknown> = {
    startTime: startTime.toISOString(),
    startTimeMsAgo: intervalLength(startTime, maxTime),
    interval
  };

  if (timeSplit && timeSplit.bucket instanceof Duration) {
    variables.granularity = timeSplit.bucket.toString();
  }

  if (essence.hasComparison()) {
    const previousTimeFilter = essence.previousTimeFilter(timekeeper);
    const shiftedStartTime = start(previousTimeFilter);
    variables.shiftedStartTime = shiftedStartTime.toISOString();
    variables.shiftedStartTimeMsAgo = intervalLength(shiftedStartTime, maxTime);
    variables.timeShift = essence.timeShift.toString();
  }

  return variables;
}

export function logQueryInfo(essence: Essence, timekeeper: Timekeeper, logger: Logger, executionTime: number, context: Record<string, unknown>) {
  const nonTimeFilters = essence.filter.removeClause(essence.getTimeDimension().name);

  logger.log(`Visualization query ${essence.description(timekeeper)}`, {
    ...context,
    executionTime,
    ...timeVariables(essence, timekeeper),
    dataCube: essence.dataCube.name,
    visualization: essence.visualization.name,
    filters: nonTimeFilters.clauses.map(clause => clause.reference).toArray(),
    splits: essence.splits.splits.map(split => split.reference).toArray(),
    measures: essence.series.series.flatMap(usedMeasures).toSet().toArray()
  });
}
