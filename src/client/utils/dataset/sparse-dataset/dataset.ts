/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { Timezone } from "chronoshift";
import { Dataset, Datum, NumberRange, TimeRange } from "plywood";
import { SortDirection } from "../../../../common/models/sort/sort";
import { Split, SplitType } from "../../../../common/models/split/split";
import { formatValue } from "../../../../common/utils/formatter/formatter";
import { SPLIT } from "../../../config/constants";

type Order<D> = (a: [string, number, D], b: [string, number, D]) => number;

export const orderByValueDecreasing: Order<unknown> = ([_, countA], [__, countB]) => {
  if (countA < countB) {
    return 1;
  }

  if (countA > countB) {
    return -1;
  }

  return 0;
};

export const orderByValueIncreasing: Order<unknown> = (a, b) => {
  return -orderByValueDecreasing(a, b);
};

export const orderByTimeDimensionDecreasing: Order<TimeRange> = ([_, __, originalA], [___, ____, originalB]) => -originalA.compare(originalB);
export const orderByTimeDimensionIncreasing: Order<TimeRange> = ([_, __, originalA], [___, ____, originalB]) => originalA.compare(originalB);

export const orderByNumberRangeDimensionDecreasing: Order<NumberRange> = ([_, __, originalA], [___, ____, originalB]) => -originalA.compare(originalB);
export const orderByNumberRangeDimensionIncreasing: Order<NumberRange> = ([_, __, originalA], [___, ____, originalB]) => originalA.compare(originalB);

const datumKey = (dataset: Datum, key: string, timezone: Timezone): string =>
  formatValue(dataset[key], timezone);

const splitToFillOrder = (split: Split): Order<unknown> => {
  const sort = split.sort;
  switch (split.type) {
    case SplitType.string:
    default:
      if (sort.direction === SortDirection.ascending) {
        return orderByValueIncreasing;
      } else {
        return orderByValueDecreasing;
      }
    case SplitType.time:
      if (sort.direction === SortDirection.ascending) {
        return orderByTimeDimensionIncreasing;
      } else {
        return orderByTimeDimensionDecreasing;
      }
    case SplitType.number:
      if (sort.direction === SortDirection.ascending) {
        return orderByNumberRangeDimensionIncreasing;
      } else {
        return orderByNumberRangeDimensionDecreasing;
      }
  }
};

export const fillDatasetWithMissingValues = (dataset: Dataset, measureName: string, secondSplit: Split, timezone: Timezone): Dataset => {
  const totals: { [ident: string]: number } = {};
  const identToOriginalKey: { [ident: string]: any } = {};
  const order = splitToFillOrder(secondSplit);
  const secondSplitName = secondSplit.reference;

  for (const datum of dataset.data) {
    const nestedDataset = (datum[SPLIT] as Dataset).data;

    for (const nestedDatum of nestedDataset) {
      const value = nestedDatum[measureName] as number;
      const ident = datumKey(nestedDatum, secondSplitName, timezone);

      if (totals[ident] !== undefined) {
        totals[ident] += value;
      } else {
        totals[ident] = value;
        identToOriginalKey[ident] = nestedDatum[secondSplitName];
      }
    }
  }

  const sortedIdents = Object.keys(totals)
    .map(ident => [ident, totals[ident], identToOriginalKey[ident]] as [string, number, any])
    .sort(order)
    .map(([ident]) => ident);

  const newDataset = dataset.data.map(datum => {

    const identToNestedDatum = (datum[SPLIT] as Dataset).data.reduce((datumsByIdent, datum) => {
      const ident = datumKey(datum, secondSplitName, timezone);
      datumsByIdent[ident] = datum;
      return datumsByIdent;
    }, {} as {[index: string]: Datum});

    const filledNestedDataset = sortedIdents.map(ident => {
      const nestedDatum = identToNestedDatum[ident];

      if (nestedDatum) {
        return {
          ...nestedDatum,
          [measureName]: Number.isNaN(Number(nestedDatum[measureName])) ? 0 : nestedDatum[measureName]
        };
      } else {
        return {
          [secondSplitName]: identToOriginalKey[ident],
          [measureName]: 0
        } as Datum;
      }
    });

    return {
      ...datum,
      [SPLIT]: (datum[SPLIT] as Dataset).changeData(filledNestedDataset)
    } as Datum;
  });

  return dataset.changeData(newDataset);
};
