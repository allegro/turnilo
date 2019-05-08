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

import { expect } from "chai";
import { Timezone } from "chronoshift";
import { Dataset } from "plywood";
import { SPLIT } from "../../config/constants";
import "../../utils/test-utils";
import {
  fillDatasetWithMissingValues,
  orderByNumberRangeDimensionIncreasing,
  orderByTimeDimensionDecreasing,
  orderByTimeDimensionIncreasing,
  orderByValueDecreasing,
  orderByValueIncreasing
} from "./dataset";
import { expectedDataset, expectedDatasetReversed, rawDataset, rawDatasetWithTimeDimension, rawDataWithNumberRanges, reversedDatasetWithTimeDimension } from "./test-fixtures";

const timezone = Timezone.UTC;

describe("Dataset", () => {
  it("works", () => {
    expect(fillDatasetWithMissingValues(Dataset.fromJS(rawDataset.data[0][SPLIT] as Dataset), "pv_count", "site", orderByValueDecreasing, timezone).toJS())
      .to.deep.equal(Dataset.fromJS(expectedDataset.data[0][SPLIT] as Dataset).toJS());
  });

  it("works reversed", () => {
    expect(fillDatasetWithMissingValues(Dataset.fromJS(rawDataset.data[0][SPLIT] as Dataset), "pv_count", "site", orderByValueIncreasing, timezone).toJS())
      .to.deep.equal(Dataset.fromJS(expectedDatasetReversed.data[0][SPLIT] as Dataset).toJS());
  });

  it("works with time dimension", () => {
    expect(fillDatasetWithMissingValues(Dataset.fromJS(rawDatasetWithTimeDimension.data[0][SPLIT] as Dataset), "click", "__time", orderByTimeDimensionIncreasing, timezone).toJS())
      .to.deep.equal(Dataset.fromJS(rawDatasetWithTimeDimension.data[0][SPLIT] as Dataset).toJS());
  });

  it("works when reversing time dimension", () => {
    expect(fillDatasetWithMissingValues(Dataset.fromJS(rawDatasetWithTimeDimension.data[0][SPLIT] as Dataset), "click", "__time", orderByTimeDimensionDecreasing, timezone).toJS())
    .to.deep.equal(Dataset.fromJS(reversedDatasetWithTimeDimension.data[0][SPLIT] as Dataset).toJS());
  });

  it("works with number ranges", () => {
    expect(fillDatasetWithMissingValues(Dataset.fromJS(rawDataWithNumberRanges.data[0][SPLIT] as Dataset), "added", "deltaBucket100", orderByNumberRangeDimensionIncreasing, timezone).toJS())
    .to.deep.equal(Dataset.fromJS(rawDataWithNumberRanges.data[0][SPLIT] as Dataset).toJS());
  });
});
