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

import { Timezone } from "chronoshift";
import { Dataset, Datum, TimeRange } from "plywood";
import { formatValue } from "../../../common/utils/formatter/formatter";
import { SPLIT } from "../../config/constants";

export type Order<D> = (a: [string, number, D], b: [string, number, D]) => number;

export const orderByValueDecreasing: Order<any> = ([_, countA], [__, countB]) => {
  if (countA < countB) {
    return 1;
  }

  if (countA > countB) {
    return -1;
  }

  return 0;
};

export const orderByValueIncreasing: Order<any> = (a, b) => {
  return -orderByValueDecreasing(a, b);
};

export const orderByTimeDimensionDecreasing: Order<TimeRange> = ([_, __, originalA], [___, ____, originalB]) => originalA.compare(originalB);
export const orderByTimeDimensionIncreasing: Order<TimeRange> = ([_, __, originalA], [___, ____, originalB]) => -originalA.compare(originalB);

export const fillDatasetWithMissingValues = (dataset: Dataset, measureName: string, secondSplitName: string, order: Order<any>, timezone: Timezone): Dataset => {
  const labels: { [index: string]: number } = {};
  const labelsToOriginalValues: { [index: string]: any } = {};

  for (const datum of dataset.data) {
    const secondDataset = (datum[SPLIT] as Dataset).data;

    for (const secondDatum of secondDataset) {
      const value = secondDatum[measureName] as number;
      const label = formatValue(secondDatum[secondSplitName], timezone);

      if (labels[label] !== undefined) {
        labels[label] += value;
      } else {
        labels[label] = value;
        labelsToOriginalValues[label] = secondDatum[secondSplitName];
      }
    }
  }
  const sortedLabels = Object.keys(labels)
    .map(label => [label, labels[label], labelsToOriginalValues[label]] as [string, number, any])
    .sort(order)
    .map(([label]) => label);

  const newDataset = dataset.data.map(datum => {

    const secondDatasetBySecondSplitName = (datum[SPLIT] as Dataset).data.reduce((acc, datum) => {
      acc[formatValue(datum[secondSplitName], timezone)] = datum;
      return acc;
    }, {} as {[index: string]: Datum});

    const newSecondDataset = sortedLabels.map(label => {
      const value = secondDatasetBySecondSplitName[label];

      if (value) {
        return value;
      } else {
        return {
          [secondSplitName]: labelsToOriginalValues[label],
          [measureName]: 0
        } as Datum;
      }
    });

    return {
      ...datum,
      [SPLIT]: (datum[SPLIT] as Dataset).changeData(newSecondDataset)
    } as Datum;
  });

  return dataset.changeData(newDataset);
};
