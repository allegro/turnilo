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

import { Dataset, Datum, NumberRange, TimeRange } from "plywood";
import { Split } from "../../../../../common/models/split/split";
import { Binary, cons, replaceAt, Unary } from "../../../../../common/utils/functional/functional";
import { SPLIT } from "../../../../config/constants";
import { selectFirstSplitDatums, selectSplitDatums } from "../../../../utils/dataset/selectors/selectors";
import { BarChartModel, isStacked } from "./bar-chart-model";

function rangeComparator(continuousSplit: Split): Binary<Datum, Datum, number> {
  return (a: Datum, b: Datum) => {
    const aRange = continuousSplit.selectValue<TimeRange | NumberRange>(a);
    const bRange = continuousSplit.selectValue<TimeRange | NumberRange>(b);
    /*
      NOTE: Conflict of variance:
      `aRange` has type `TimeRange | NumberRange` and as a result
      argument of `aRange.compare` has type `TimeRange & NumberRange`.
      Such type is impossible, thus error
    */
    return aRange.compare(bRange as TimeRange & NumberRange);
  };
}

function equalBy(split: Split, datum: Datum): Unary<Datum, boolean> {
  const value = split.selectValue(datum);
  return (d: Datum) => {
    const range = split.selectValue(d);
    if (TimeRange.isTimeRange(value) && TimeRange.isTimeRange(range)) {
      return value.equals(range);
    }
    if (NumberRange.isNumberRange(value) && NumberRange.isNumberRange(range)) {
      return value.equals(range);
    }
    return false;
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

  const { continuousSplit } = model;
  const { data } = dataset.flatten();

  const result = data.reduce((coll: Datum[], currentDatum: Datum) => {
    const idx = coll.findIndex(equalBy(continuousSplit, currentDatum));
    const notFound = idx === -1;

    if (notFound) {
      return cons(coll, createInnerDatum(continuousSplit.reference, currentDatum));
    }

    return replaceAt(coll, idx, mergeDatums(continuousSplit.reference, coll[idx], currentDatum));
  }, []);

  return result.sort(rangeComparator(continuousSplit));
}
