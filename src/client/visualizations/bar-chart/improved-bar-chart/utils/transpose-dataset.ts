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

import { Dataset, Datum, TimeRange } from "plywood";
import { Binary, cons, replaceAt, Unary } from "../../../../../common/utils/functional/functional";
import { SPLIT } from "../../../../config/constants";
import { selectFirstSplitDatums, selectSplitDatums } from "../../../../utils/dataset/selectors/selectors";
import { BarChartModel, isStacked } from "./bar-chart-model";

function rangeComparator(continuousRef: string): Binary<Datum, Datum, number> {
  return (a: Datum, b: Datum) => {
    const aRange = a[continuousRef] as TimeRange;
    const bRange = b[continuousRef] as TimeRange;
    return aRange.compare(bRange);
  };
}

function equalBy(continuousRef: string, datum: Datum): Unary<Datum, boolean> {
  const value = datum[continuousRef];
  return (d: Datum) => {
    const range = d[continuousRef];
    return TimeRange.isTimeRange(value) && TimeRange.isTimeRange(range) && value.equals(range);
  };
}

function constructDatum(continuousRef: string, range: TimeRange, splitData: Datum[]): Datum {
  return {
    [continuousRef]: range,
    [SPLIT]: new Dataset({ data: splitData })
  };
}

function createInnerDatum(continuousRef: string, datum: Datum): Datum {
  const { [continuousRef]: continuousAttr, ...splitDatum } = datum;
  return constructDatum(continuousRef, continuousAttr as TimeRange, [splitDatum]);
}

function mergeDatums(continuousRef: string, datum: Datum, newDatum: Datum): Datum {
  const splitData = selectSplitDatums(datum);
  const { [continuousRef]: continuousAttr, ...splitDatum } = newDatum;
  return constructDatum(continuousRef, continuousAttr as TimeRange, [...splitData, splitDatum]);
}

export function transposeDataset(dataset: Dataset, model: BarChartModel): Datum[] {
  if (!isStacked(model)) return selectFirstSplitDatums(dataset);

  const { reference } = model.continuousSplit;
  const { data } = dataset.flatten();

  const result = data.reduce((coll: Datum[], currentDatum: Datum) => {
    const idx = coll.findIndex(equalBy(reference, currentDatum));
    const notFound = idx === -1;

    if (notFound) {
      return cons(coll, createInnerDatum(reference, currentDatum));
    }

    return replaceAt(coll, idx, mergeDatums(reference, coll[idx], currentDatum));
  }, []);

  return result.sort(rangeComparator(reference));
}
