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

import { expect } from "chai";
import { Timezone } from "chronoshift";
import { Dataset } from "plywood";
import { DimensionSort, SortDirection } from "../../../../common/models/sort/sort";
import { Split, SplitType } from "../../../../common/models/split/split";
import { SPLIT } from "../../../config/constants";
import "../../test-utils";
import { fillDatasetWithMissingValues } from "./dataset";
import { expectedDataset, expectedDatasetReversed, rawDataset, rawDatasetWithTimeDimension, rawDataWithNumberRanges, reversedDatasetWithTimeDimension } from "./test-fixtures";

const timezone = Timezone.UTC;

const mockSplit = (reference: string, type: SplitType, direction: SortDirection) =>
  new Split({ reference, type, sort: new DimensionSort({ reference, direction }) });

const pickNestedDataset = (dataset: Dataset) => Dataset.fromJS(dataset.data[0][SPLIT] as Dataset);

describe("Dataset", () => {
  it("works", () => {
    const siteSplit = mockSplit("site", SplitType.string, SortDirection.descending);
    const inputDataset = pickNestedDataset(rawDataset);
    const expectedInnerDataset = pickNestedDataset(expectedDataset);
    const filledInnerDataset = fillDatasetWithMissingValues(inputDataset, "pv_count", siteSplit, timezone);
    expect(filledInnerDataset.equals(expectedInnerDataset)).to.be.true;
  });

  it("works reversed", () => {
    const siteSplit = mockSplit("site", SplitType.string, SortDirection.ascending);
    const inputDataset = pickNestedDataset(rawDataset);
    const expectedInnerDataset = pickNestedDataset(expectedDatasetReversed);
    const filledInnerDataset = fillDatasetWithMissingValues(inputDataset, "pv_count", siteSplit, timezone);
    expect(filledInnerDataset.equals(expectedInnerDataset)).to.be.true;
  });

  it("works with time dimension", () => {
    const timeSplit = mockSplit("__time", SplitType.time, SortDirection.ascending);
    const inputDataset = pickNestedDataset(rawDatasetWithTimeDimension);
    const expectedInnerDataset = pickNestedDataset(rawDatasetWithTimeDimension);
    const filledInnerDataset = fillDatasetWithMissingValues(inputDataset, "click", timeSplit, timezone);
    expect(filledInnerDataset.equals(expectedInnerDataset)).to.be.true;
  });

  it("works when reversing time dimension", () => {
    const timeSplit = mockSplit("__time", SplitType.time, SortDirection.descending);
    const inputDataset = pickNestedDataset(rawDatasetWithTimeDimension);
    const expectedInnerDataset = pickNestedDataset(reversedDatasetWithTimeDimension);
    const filledInnerDataset = fillDatasetWithMissingValues(inputDataset, "click", timeSplit, timezone);
    expect(filledInnerDataset.equals(expectedInnerDataset)).to.be.true;
  });

  it("works with number ranges", () => {
    const deltaSplit = mockSplit("deltaBucket100", SplitType.number, SortDirection.ascending);
    const inputDataset = pickNestedDataset(rawDataWithNumberRanges);
    const expectedInnerDataset = pickNestedDataset(rawDataWithNumberRanges);
    const filledInnerDataset = fillDatasetWithMissingValues(inputDataset, "added", deltaSplit, timezone);
    expect(filledInnerDataset.equals(expectedInnerDataset)).to.be.true;
  });
});
