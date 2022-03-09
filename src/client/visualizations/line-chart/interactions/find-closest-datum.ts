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

import { Dataset, Datum, NumberRange, Range, TimeRange } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { Split } from "../../../../common/models/split/split";
import { selectFirstSplitDataset, selectFirstSplitDatums } from "../../../utils/dataset/selectors/selectors";
import { ContinuousScale, ContinuousValue } from "../utils/continuous-types";
import { getContinuousSplit, hasNominalSplit } from "../utils/splits";

const MAX_HOVER_DIST = 50;

function findClosest(data: Datum[], value: ContinuousValue, scaleX: ContinuousScale, continuousSplit: Split): Datum | null {
  let closestDatum: Datum = null;
  let minDist = Infinity;
  for (const datum of data) {
    const continuousSegmentValue = continuousSplit.selectValue<TimeRange | NumberRange>(datum);
    if (!continuousSegmentValue || !Range.isRange(continuousSegmentValue)) continue; // !Range.isRange => temp solution for non-bucketed reaching here
    const mid = continuousSegmentValue.midpoint();
    const dist = Math.abs(mid.valueOf() - value.valueOf());
    const distPx = Math.abs(scaleX(mid) - scaleX(value));
    if ((!closestDatum || dist < minDist) && distPx < MAX_HOVER_DIST) { // Make sure it is not too far way
      closestDatum = datum;
      minDist = dist;
    }
  }
  return closestDatum;
}

export function findClosestDatum(value: ContinuousValue, essence: Essence, dataset: Dataset, xScale: ContinuousScale): Datum | null {
  const continuousSplit = getContinuousSplit(essence);
  if (hasNominalSplit(essence)) {
    const flattened = selectFirstSplitDataset(dataset).flatten();
    return findClosest(flattened.data, value, xScale, continuousSplit);
  }
  return findClosest(selectFirstSplitDatums(dataset), value, xScale, continuousSplit);
}
