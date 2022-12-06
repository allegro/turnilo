/*
 * Copyright 2017-2021 Allegro.pl
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
import { $ } from "plywood";
import { DEFAULT_COLORS } from "../../models/colors/colors";
import { createDimension, Dimension } from "../../models/dimension/dimension";
import { SeriesList } from "../../models/series-list/series-list";
import { measureSeries } from "../../models/series/series.fixtures";
import { DimensionSort, SeriesSort, SortDirection } from "../../models/sort/sort";
import { numberSplitCombine, stringSplitCombine, timeSplitCombine } from "../../models/split/split.fixtures";
import {
  adjustColorSplit, adjustContinuousSplit,
  adjustFiniteLimit,
  adjustLimit,
  adjustSort
} from "./split-adjustments";

describe("Split adjustment utilities", () => {
  describe("adjustContinuousSplit", () => {
    it("should set limit to null", () => {
      const timeSplit = timeSplitCombine("time", undefined, { limit: 500 });
      const adjusted = adjustContinuousSplit(timeSplit);
      expect(adjusted.limit).to.be.null;
    });

    it("should set sort to itself", () => {
      const timeSplit = timeSplitCombine("time", undefined, {
        sort: {
          reference: "foobar",
          direction: SortDirection.descending
        }
      });
      const expectedSort = new DimensionSort({
        reference: "time",
        direction: SortDirection.ascending
      });
      const adjusted = adjustContinuousSplit(timeSplit);
      expect(adjusted.sort).to.be.equivalent(expectedSort);
    });
  });

  describe("adjustFiniteLimit", () => {
    it("should pass valid limit", () => {
      const split = stringSplitCombine("foobar", { limit: 50 });
      const adjusted = adjustFiniteLimit([10, 50, 100])(split);

      expect(adjusted.limit).to.be.equal(50);
    });

    it("should adjust invalid limit", () => {
      const split = stringSplitCombine("foobar", { limit: 49 });
      const adjusted = adjustFiniteLimit([10, 50, 100])(split);

      expect(adjusted.limit).to.be.equal(10);
    });

    it("should adjust invalid limit with explicit default", () => {
      const split = stringSplitCombine("foobar", { limit: 49 });
      const adjusted = adjustFiniteLimit([10, 50, 100], 42)(split);

      expect(adjusted.limit).to.be.equal(42);
    });
  });

  describe("adjustLimit", () => {
    it("should pass valid limit", () => {
      const dimension: Dimension = {
        ...createDimension("string", "foobar", $("foobar")),
        limits: [42, 100]
      };
      const split = stringSplitCombine("foobar", { limit: 42 });
      const adjusted = adjustLimit(dimension)(split);

      expect(adjusted.limit).to.be.equal(42);
    });

    it("should adjust limit with dimension limits", () => {
      const dimension: Dimension = {
        ...createDimension("string", "foobar", $("foobar")),
        limits: [42, 100]
      };
      const split = stringSplitCombine("foobar", { limit: 50 });
      const adjusted = adjustLimit(dimension)(split);

      expect(adjusted.limit).to.be.equal(42);
    });

    it("should accept null for time dimension", () => {
      const dimension: Dimension = {
        ...createDimension("time", "time", $("foobar")),
        limits: [42, 100]
      };
      const split = stringSplitCombine("time", { limit: null });
      const adjusted = adjustLimit(dimension)(split);

      expect(adjusted.limit).to.be.null;
    });
  });

  describe("adjustColorSplit", () => {
    it("should adjust limit with predefined limits (5, 10)", () => {
      const dimension: Dimension = {
        ...createDimension("string", "foobar", $("foobar")),
        limits: [42, 100]
      };
      const split = stringSplitCombine("foobar", { limit: 50 });
      const adjusted = adjustColorSplit(split, dimension, SeriesList.fromSeries([]), DEFAULT_COLORS);

      expect(adjusted.limit).to.be.equal(10);
    });
  });

  describe("adjustSort", () => {
    const series = SeriesList.fromSeries([
      measureSeries("qvux"),
      measureSeries("bazz")
    ]);

    const foobarDimension = createDimension("string", "foobar", $("foobar"));

    const dimensionSort = (reference: string) => new DimensionSort({ reference, direction: SortDirection.descending });
    const seriesSort = (reference: string) => new SeriesSort({ reference, direction: SortDirection.descending });

    it("should return back split with series sort", () => {
      const split = stringSplitCombine("foobar", { sort: seriesSort("qvux") });
      const adjusted = adjustSort(foobarDimension, series)(split);

      expect(adjusted).to.be.equivalent(split);
    });

    it("should return back split with sort on itself", () => {
      const split = stringSplitCombine("foobar", { sort: dimensionSort("foobar") });
      const adjusted = adjustSort(foobarDimension, series)(split);

      expect(adjusted).to.be.equivalent(split);
    });

    it("should return back split with sort on available dimension", () => {
      const split = stringSplitCombine("foobar").changeSort(dimensionSort("hodge"));
      const adjusted = adjustSort(foobarDimension, series, ["foobar", "hodge"])(split);

      expect(adjusted).to.be.equivalent(split);
    });

    it("should adjust sort on itself for sort strategy 'self'", () => {
      const split = stringSplitCombine("foobar").changeSort(dimensionSort("hodge"));
      const adjusted = adjustSort({ ...foobarDimension, sortStrategy: "self" }, series)(split);

      expect(adjusted.sort).to.be.equivalent(dimensionSort("foobar"));
    });

    it("should adjust sort on itself for sort strategy equal to itself", () => {
      const split = stringSplitCombine("foobar").changeSort(dimensionSort("hodge"));
      const adjusted = adjustSort({ ...foobarDimension, sortStrategy: "foobar" }, series)(split);

      expect(adjusted.sort).to.be.equivalent(dimensionSort("foobar"));
    });

    it("should adjust sort on available series according to sort strategy", () => {
      const split = stringSplitCombine("foobar").changeSort(dimensionSort("hodge"));
      const adjusted = adjustSort({ ...foobarDimension, sortStrategy: "bazz" }, series)(split);

      expect(adjusted.sort).to.be.equivalent(seriesSort("bazz"));
    });

    it("should adjust sort on first series if sort strategy is impossible and is string split", () => {
      const split = stringSplitCombine("foobar").changeSort(dimensionSort("hodge"));
      const adjusted = adjustSort({ ...foobarDimension, sortStrategy: "dummy-series" }, series)(split);

      expect(adjusted.sort).to.be.equivalent(seriesSort("qvux"));
    });

    it("should adjust sort on itself if sort strategy is impossible and is not string split", () => {
      const split = numberSplitCombine("foobar").changeSort(dimensionSort("hodge"));
      const adjusted = adjustSort({ ...foobarDimension, sortStrategy: "dummy-series" }, series)(split);

      expect(adjusted.sort).to.be.equivalent(dimensionSort("foobar"));
    });

    it("should adjust sort on first series if no sort strategy is provided and is string split", () => {
      const split = stringSplitCombine("foobar").changeSort(dimensionSort("hodge"));
      const adjusted = adjustSort({ ...foobarDimension, sortStrategy: "dummy-series" }, series)(split);

      expect(adjusted.sort).to.be.equivalent(seriesSort("qvux"));
    });

    it("should adjust sort on itself if no sort strategy is provided and is not string split", () => {
      const split = numberSplitCombine("foobar").changeSort(dimensionSort("hodge"));
      const adjusted = adjustSort({ ...foobarDimension, sortStrategy: "dummy-series" }, series)(split);

      expect(adjusted.sort).to.be.equivalent(dimensionSort("foobar"));
    });
  });

});
