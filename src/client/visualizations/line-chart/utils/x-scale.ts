/*
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

import { Duration, Timezone } from "chronoshift";
import * as d3 from "d3";
import { Dataset, PlywoodRange, Range } from "plywood";
import { getMaxTime } from "../../../../common/models/data-cube/data-cube";
import { Essence } from "../../../../common/models/essence/essence";
import { ContinuousDimensionKind } from "../../../../common/models/granularity/granularity";
import { Split } from "../../../../common/models/split/split";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { union } from "../../../../common/utils/plywood/range";
import { toPlywoodRange } from "../../../utils/highlight-clause/highlight-clause";
import { ContinuousRange, ContinuousScale } from "./continuous-types";
import { getContinuousDimension, getContinuousSplit } from "./splits";

// This function is responsible for aligning d3 types with our domain types.
export function createContinuousScale(essence: Essence, domainRange: PlywoodRange, width: number): ContinuousScale {
  const continuousDimension = getContinuousDimension(essence);
  const kind = continuousDimension.kind as ContinuousDimensionKind;
  const range = [0, width];
  switch (kind) {
    case "number": {
      const domain = [domainRange.start, domainRange.end] as [number, number];
      return (d3.scaleLinear().clamp(true) as unknown as ContinuousScale).domain(domain).range(range);
    }
    case "time": {
      const domain = [domainRange.start, domainRange.end] as [Date, Date];
      return (d3.scaleTime().clamp(true) as unknown as ContinuousScale).domain(domain).range(range);
    }
  }
}

function includeMaxTimeBucket(filterRange: PlywoodRange, maxTime: Date, continuousSplit: Split, timezone: Timezone) {
  const continuousBucket = continuousSplit.bucket;
  /*
    Special treatment for realtime data:
    Max time could be inside last bucket of time filter.
   */
  if (maxTime && continuousBucket instanceof Duration) {
    const filterRangeEnd = filterRange.end as Date;
    const filterRangeEndFloored = continuousBucket.floor(filterRangeEnd, timezone);
    const filterRangeEndCeiled = continuousBucket.shift(filterRangeEndFloored, timezone);
    if (filterRangeEndFloored < maxTime && maxTime < filterRangeEndCeiled) {
      return Range.fromJS({ start: filterRange.start, end: filterRangeEndCeiled });
    }
  }
  return filterRange;
}

function getFilterRange(essence: Essence, timekeeper: Timekeeper): PlywoodRange | null {
  const continuousSplit = getContinuousSplit(essence);
  const effectiveFilter = essence.getEffectiveFilter(timekeeper);
  const continuousFilterClause = effectiveFilter.clauseForReference(continuousSplit.reference);
  if (!continuousFilterClause) return null;
  const filterRange = toPlywoodRange(continuousFilterClause);
  const maxTime = getMaxTime(essence.dataCube, timekeeper);
  return includeMaxTimeBucket(filterRange, maxTime, continuousSplit, essence.timezone);
}

function safeRangeSum(a: PlywoodRange | null, b: PlywoodRange | null): PlywoodRange | null {
  return (a && b) ? a.extend(b) : (a || b);
}

function getDatasetXRange(dataset: Dataset, continuousSplit: Split): PlywoodRange | null {
  const flatDataset = dataset.flatten();
  return flatDataset
    .data
    .map(datum => continuousSplit.selectValue(datum) as PlywoodRange)
    .reduce(safeRangeSum, null);
}

export function calculateXRange(essence: Essence, timekeeper: Timekeeper, dataset: Dataset): ContinuousRange | null {
  const continuousSplit = getContinuousSplit(essence);
  const filterRange = getFilterRange(essence, timekeeper);
  const datasetRange = getDatasetXRange(dataset, continuousSplit);
  return union(filterRange, datasetRange) as ContinuousRange;
}
