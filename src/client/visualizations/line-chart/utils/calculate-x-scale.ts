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
import { Dataset, NumberRange, PlywoodRange, Range, TimeRange } from "plywood";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { FixedTimeFilterClause, NumberFilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { ContinuousDimensionKind } from "../../../../common/models/granularity/granularity";
import { Split } from "../../../../common/models/split/split";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { union } from "../../../../common/utils/plywood/range";
import { ContinuousScale } from "./scale";
import { getContinuousDimension, getContinuousSplit } from "./splits";

function getScaleX(kind: ContinuousDimensionKind, { start, end }: PlywoodRange, stageWidth: number): ContinuousScale {
  const range = [0, stageWidth];
  switch (kind) {
    case "number": {
      const domain = [start, end] as [number, number];
      return d3.scale.linear().domain(domain).range(range);
    }
    case "time": {
      const domain = [start, end] as [Date, Date];
      return d3.time.scale().domain(domain).range(range);
    }
  }
}

function ensureMaxTime(axisRange: PlywoodRange, maxTime: Date, continuousSplit: Split, timezone: Timezone) {
  // Special treatment for realtime data, i.e. time data where the maxTime is within Duration of the filter end
  const continuousBucket = continuousSplit.bucket;
  if (maxTime && continuousBucket instanceof Duration) {
    const axisRangeEnd = axisRange.end as Date;
    const axisRangeEndFloor = continuousBucket.floor(axisRangeEnd, timezone);
    const axisRangeEndCeil = continuousBucket.shift(axisRangeEndFloor, timezone);
    if (maxTime && axisRangeEndFloor < maxTime && maxTime < axisRangeEndCeil) {
      return Range.fromJS({ start: axisRange.start, end: axisRangeEndCeil });
    }
  }
  return axisRange;
}

function getFilterRange(essence: Essence, continuousSplit: Split, timekeeper: Timekeeper): PlywoodRange {
  const maxTime = essence.dataCube.getMaxTime(timekeeper);
  const continuousDimension = essence.dataCube.getDimension(continuousSplit.reference);
  const effectiveFilter = essence
    .getEffectiveFilter(timekeeper);
  const continuousFilter = effectiveFilter.getClauseForDimension(continuousDimension);

  let range = null;
  if (continuousFilter instanceof NumberFilterClause) {
    range = NumberRange.fromJS(continuousFilter.values.first());
  }
  if (continuousFilter instanceof FixedTimeFilterClause) {
    range = TimeRange.fromJS(continuousFilter.values.first());
  }
  return ensureMaxTime(range, maxTime, continuousSplit, essence.timezone);
}

function getDatasetXRange(dataset: Dataset, continuousDimension: Dimension): PlywoodRange {
  if (!dataset || dataset.count() === 0) return null;
  const key = continuousDimension.name;

  const firstDatum = dataset.data[0];
  let ranges: PlywoodRange[];
  if (firstDatum["SPLIT"]) {
    ranges = dataset.data.map(d => getDatasetXRange(d["SPLIT"] as Dataset, continuousDimension));
  } else {
    ranges = dataset.data.map(d => (d as any)[key] as PlywoodRange);
  }

  return ranges.reduce((a: PlywoodRange, b: PlywoodRange) => (a && b) ? a.extend(b) : (a || b));
}

export default function calculateXScale(essence: Essence, timekeeper: Timekeeper, dataset: Dataset, width: number): ContinuousScale {
  const continuousSplit = getContinuousSplit(essence);
  const continuousDimension = getContinuousDimension(essence);
  const filterRange = getFilterRange(essence, continuousSplit, timekeeper);
  const datasetRange = getDatasetXRange(dataset, continuousDimension);
  const axisRange = union(filterRange, datasetRange);
  if (!axisRange) return null;

  return getScaleX(continuousDimension.kind as ContinuousDimensionKind, axisRange, width);
}
