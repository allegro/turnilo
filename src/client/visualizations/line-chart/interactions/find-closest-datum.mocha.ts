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

import { expect } from "chai";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { makeDataset, nominalDataset, nonNominalDataset, scale, sparseNominalDataset, sparseNonNominalDataset } from "../../../utils/dataset/selectors/dataset-fixtures";
import { findClosestDatum } from "./find-closest-datum";

const essenceWithoutNominalSplit = EssenceFixtures.wikiLineChartNoNominalSplit();
const essenceWithNominalSplit = EssenceFixtures.wikiLineChart();

describe("findClosestDatum", () => {
  it("should return null if dataset is empty", () => {
    const dataset = makeDataset([]);
    expect(findClosestDatum(100, essenceWithoutNominalSplit, dataset, scale)).to.be.null;
  });

  it("should return null if can't find dimension data inside datums", () => {
    const dataset = makeDataset([{ "non-time-dimension": "foo" }, { "non-time-dimension": "bar" }]);
    expect(findClosestDatum(100, essenceWithoutNominalSplit, dataset, scale)).to.be.null;
  });

  describe("no nominal split", () => {
    it("should return range value belongs to", () => {
      const date = new Date("2000-01-03T07:32:11Z");
      expect(findClosestDatum(date, essenceWithoutNominalSplit, nonNominalDataset, scale)).to.be.include({
        measure: 11000
      });
    });

    it("should return null if value is outside dataset range", () => {
      const date = new Date("2001-01-01");
      expect(findClosestDatum(date, essenceWithoutNominalSplit, nonNominalDataset, scale)).to.be.null;
    });

    it("should return null if value is too far away from closest datum", () => {
      const date = new Date("2000-01-04");
      expect(findClosestDatum(date, essenceWithoutNominalSplit, sparseNonNominalDataset, scale)).to.be.null;
    });
  });

  describe("nominal split", () => {
    it("should return range value belongs to", () => {
      const date = new Date("2000-01-03T07:32:11Z");
      expect(findClosestDatum(date, essenceWithNominalSplit, nominalDataset, scale)).to.include({
        measure: 11000
      });
    });

    it("should return null if value is outside dataset range", () => {
      const date = new Date("2001-01-01");
      expect(findClosestDatum(date, essenceWithNominalSplit, nominalDataset, scale)).to.be.null;
    });

    it("should return null if value is too far away from closest datum", () => {
      const date = new Date("2000-01-03");
      expect(findClosestDatum(date, essenceWithNominalSplit, sparseNominalDataset, scale)).to.be.null;
    });
  });
});
