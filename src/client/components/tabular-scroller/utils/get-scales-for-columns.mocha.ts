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
import { VisStrategy } from "../../../../common/models/essence/essence";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { SortDirection } from "../../../../common/models/sort/sort";
import { stringSplitCombine } from "../../../../common/models/split/split.fixtures";
import { Splits } from "../../../../common/models/splits/splits";
import { getScalesForColumns } from "./get-scales-for-columns";

const essenceFixture = EssenceFixtures
  .wikiTable()
  .changeSplits(Splits.fromSplit(
    stringSplitCombine("channel", { sort: { reference: "delta", direction: SortDirection.descending }, limit: 50 })
  ), VisStrategy.KeepAlways);

const deltaSeries = essenceFixture.getConcreteSeries().get(0);
const countSeries = essenceFixture.getConcreteSeries().get(1);
const addedSeries = essenceFixture.getConcreteSeries().get(2);

const dataMock = [
  { delta: -20, count: 10000, added: -12 },
  { delta: -10, count: 1312, added: 61 },
  { delta: 0, count: 2312, added: Infinity },
  { delta: 10, count: 9231, added: -Infinity },
  { delta: 20, count: 100, added: NaN }
];

describe("getScalesForColumns", () => {
  it("should return scale for each series", () => {
    const scales = getScalesForColumns(essenceFixture, dataMock);
    expect(scales.count()).to.be.equal(3);
  });

  it("should return scales with range [0, 100]", () => {
    const scales = getScalesForColumns(essenceFixture, dataMock);
    scales.forEach(scale => {
      expect(scale.range()).to.be.deep.equal([0, 100]);
    });
  });

  describe("delta scale", () => {
    it("should return scale with correct domain", () => {
      const scales = getScalesForColumns(essenceFixture, dataMock);
      expect(scales.get(deltaSeries.reactKey()).domain()).to.be.deep.equal([-20, 20]);
    });
  });

  describe("count scale", () => {
    it("should return scale with included 0 in domain", () => {
      const scales = getScalesForColumns(essenceFixture, dataMock);
      expect(scales.get(countSeries.reactKey()).domain()).to.be.deep.equal([0, 10000]);
    });
  });

  describe("added scale", () => {
    it("should handle non numeric values", () => {
      const scales = getScalesForColumns(essenceFixture, dataMock);
      expect(scales.get(addedSeries.reactKey()).domain()).to.be.deep.equal([-Infinity, Infinity]);
    });
  });

  it("should handle missing values", () => {
    const scales = getScalesForColumns(essenceFixture, []);
    expect(scales.get(deltaSeries.reactKey()).domain()).to.be.deep.equal([0, 0]);
  });
});
