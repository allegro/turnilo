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

import { Duration, Timezone } from "chronoshift";
import { Set } from "immutable";
import { cloneDeep, mapValues, merge, mergeWith, property, unionBy } from "lodash";
import { AttributeInfo, Dataset, Datum, TimeRange } from "plywood";
import { Period } from "../../../common/models/periods/periods";
import { SPLIT } from "../../config/constants";
import { Unary } from "../functional/functional";

interface WithSplit {
  [SPLIT]?: Dataset;
}

type DataFrame = WithSplit & Datum;

function mergeAttributes(curr: AttributeInfo[], prev: AttributeInfo[]): AttributeInfo[] {
  return unionBy(curr, prev, property("name"));
}

function normalize(prev: DataFrame, factor: number): DataFrame {
  return mapValues(prev, (value: any, key: string) => {
    if (key.startsWith(Period.PREVIOUS)) {
      return value / factor;
    }
    return value;
  });
}

function mergeData(current: DataFrame[], previous: DataFrame[], timeShift: Duration, timezone: Timezone): DataFrame[] {

  function mergeSeries(current: DataFrame[], previous: DataFrame[], keyFn: Unary<DataFrame, object>) {
    const usedPrevious = Set([]);
    const currData = current.map(currDatum => {
      const id = keyFn(currDatum);
      const prevDatum = previous.find(val => keyFn(val) === id);
      if (!prevDatum) {
        return currDatum;
      }
      usedPrevious.add(prevDatum);
      return mergeDatum(currDatum, prevDatum);
    });

    const prevData = previous.filter(prevDatum => !usedPrevious.contains(prevDatum));

    return [...currData, ...prevData];
  }

  function shift({ bounds, start, end }: TimeRange, timeShift: Duration, timezone: Timezone, step = 1): TimeRange {
    return TimeRange.fromJS({
      start: timeShift.shift(start, timezone, step),
      end: timeShift.shift(end, timezone, step),
      bounds
    });
  }

  function mergeTimeSeries(current: DataFrame[], previous: DataFrame[], getTime: Unary<DataFrame, TimeRange>) {
    return current.map(curr => {
      const shiftedTime = shift(getTime(curr), timeShift, timezone, -1);
      const prev = previous.find(p => {
        return getTime(p).contains(shiftedTime);
      });
      if (prev) {
        const shiftedPrevTime = shift(getTime(prev), timeShift, timezone);
        debugger;
        const covers = current.filter(c => getTime(c).contains(shiftedPrevTime));
        const count = covers.length;
        return mergeDatum(curr, normalize(prev, count));
      }
      return curr;
    });

  }

  function mergeSplit(current: Dataset, previous: Dataset): Dataset {
    const attributes = mergeAttributes(current.attributes, previous.attributes);
    const keys = current.keys;
    const key = property(keys[0]);

    const isTimeDimension = TimeRange.isTimeRange(key(current.data[0]));
    const data = isTimeDimension ? mergeTimeSeries(current.data, previous.data, key as Unary<DataFrame, TimeRange>) : mergeSeries(current.data, previous.data, key);

    return new Dataset({ keys, data, attributes });
  }

  function mergeDatum(current: DataFrame, previous: DataFrame): DataFrame {
    if (current[SPLIT] !== undefined && previous[SPLIT] !== undefined) {
      return { ...previous, ...current, [SPLIT]: mergeSplit(current[SPLIT], previous[SPLIT]) };
    }
    return { ...previous, ...current };
  }

  return mergeWith(current, previous, mergeDatum);
}

export default function mergeDataSets(current: Dataset, previous?: Dataset, timeShift?: Duration, timezone?: Timezone): Dataset {
  if (previous === undefined) {
    return current;
  }
  const currentClone = cloneDeep(current);
  return merge(currentClone, {
    data: mergeData(currentClone.data, previous.data, timeShift, timezone),
    attributes: mergeAttributes(currentClone.attributes, previous.attributes)
  });
}
