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

import { cloneDeep, merge, mergeWith, property, unionBy } from "lodash";
import { AttributeInfo, Dataset, Datum } from "plywood";
import { SPLIT } from "../../config/constants";

interface WithSplit {
  [SPLIT]?: Dataset;
}

type DataFrame = WithSplit & Datum;

function mergeSplit(current: Dataset, previous: Dataset): Dataset {
  const keys = current.keys;
  const key = property(keys[0]);

  const data = current.data.map(currDatum => {
    const id = key(currDatum);
    const prevDatum = previous.data.find(val => key(val) === id);
    return prevDatum ? mergeDatum(currDatum, prevDatum) : currDatum;
  });

  return new Dataset({
    keys,
    data,
    attributes: mergeAttributes(current.attributes, previous.attributes)
  });
}

function mergeDatum(current: DataFrame, previous: DataFrame): DataFrame {
  if (current[SPLIT] !== undefined && previous[SPLIT] !== undefined) {
    return { ...previous, ...current, [SPLIT]: mergeSplit(current[SPLIT], previous[SPLIT]) };
  }
  return { ...previous, ...current };
}

function mergeData(current: DataFrame[], previous: DataFrame[]): DataFrame[] {
  return mergeWith(current, previous, mergeDatum);
}

function mergeAttributes(curr: AttributeInfo[], prev: AttributeInfo[]): AttributeInfo[] {
  return unionBy(curr, prev, property("name"));
}

export default function mergeDataSets(current: Dataset, previous?: Dataset): Dataset {
  if (previous === undefined) {
    return current;
  }
  const currentClone = cloneDeep(current);
  try {
    return merge(currentClone, {
      data: mergeData(currentClone.data, previous.data),
      attributes: mergeAttributes(currentClone.attributes, previous.attributes)
    });
  } catch (e) {
    debugger;
    return current;
  }
}
