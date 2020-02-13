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
import { Essence } from "../../../../common/models/essence/essence";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { SeriesDerivation } from "../../../../common/models/series/concrete-series";
import { TimeShift } from "../../../../common/models/time-shift/time-shift";
import { HEADER_HEIGHT, ROW_HEIGHT } from "../table";
import { HoverElement, rowPosition, seriesPosition as uncurriedSeriesPosition } from "./calculate-hover-position";

describe("Calculate Hover Position", () => {
  describe("seriesPosition", () => {
    const segmentWidth = 100;
    const columnWidth = 50;
    const offsetForNthColumn = (n: number) => segmentWidth + ((n - 0.5) * columnWidth);
    const seriesPosition = (x: number, essence: Essence) => uncurriedSeriesPosition(x, essence, segmentWidth, columnWidth);

    const wiki = EssenceFixtures.wikiTable();

    it("should return header element for valid offset", () => {
      const position = seriesPosition(offsetForNthColumn(1), wiki);
      expect(position).to.include({ element: HoverElement.HEADER });
    });

    describe("without timeshift", () => {
      it("should return second series for given offset", () => {
        const position = seriesPosition(offsetForNthColumn(2), wiki);
        const secondSeries = wiki.series.series.get(1);
        expect(position).to.include({
          series: secondSeries,
          period: SeriesDerivation.CURRENT
        });
      });

      it("should return whitespace for invalid offset", () => {
        const seriesCount = wiki.series.series.count();
        const position = seriesPosition(offsetForNthColumn(seriesCount + 1), wiki);
        expect(position).to.include({ element: HoverElement.WHITESPACE });
      });
    });

    describe("without timeshift", () => {
      const wikiWithTimeshift = wiki.changeComparisonShift(TimeShift.fromJS("P1D"));

      it("should return second series in current period for given offset", () => {
        const position = seriesPosition(offsetForNthColumn(4), wikiWithTimeshift);
        const secondSeries = wiki.series.series.get(1);
        expect(position).to.include({
          series: secondSeries,
          period: SeriesDerivation.CURRENT
        });
      });

      it("should return second series in previous period for given offset", () => {
        const position = seriesPosition(offsetForNthColumn(5), wikiWithTimeshift);
        const secondSeries = wiki.series.series.get(1);
        expect(position).to.include({
          series: secondSeries,
          period: SeriesDerivation.PREVIOUS
        });
      });

      it("should return second series delta for given offset", () => {
        const position = seriesPosition(offsetForNthColumn(6), wikiWithTimeshift);
        const secondSeries = wiki.series.series.get(1);
        expect(position).to.include({
          series: secondSeries,
          period: SeriesDerivation.DELTA
        });
      });

      it("should return whitespace for invalid offset", () => {
        const seriesCount = wiki.series.series.count();
        const invalidSeriesIndex = seriesCount * 3 + 1;
        const position = seriesPosition(offsetForNthColumn(invalidSeriesIndex), wikiWithTimeshift);
        expect(position).to.include({ element: HoverElement.WHITESPACE });
      });
    });
  });

  describe("rowPosition", () => {
    const offsetForNthRow = (n: number) => HEADER_HEIGHT + ((n - 0.5) * ROW_HEIGHT);

    it("should return row element for valid offset", () => {
      const position = rowPosition(offsetForNthRow(1), [{}]);
      expect(position).to.include({ element: HoverElement.ROW });
    });

    it("should return 3rd datum for given offset", () => {
      const expectedDatum = { foobar: "data" };
      const position = rowPosition(offsetForNthRow(3), [{}, {}, expectedDatum]);
      expect(position).to.include({ datum: expectedDatum });
    });

    it("should return whitespace for invalid offset", () => {
      const position = rowPosition(offsetForNthRow(2), [{}]);
      expect(position).to.include({ element: HoverElement.WHITESPACE });
    });
  });
});
