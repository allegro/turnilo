/*
 * Copyright 2017-2022 Allegro.pl
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
import { VisStrategy } from "../models/essence/essence";
import { EssenceFixtures } from "../models/essence/essence.fixtures";
import { measureSeries } from "../models/series/series.fixtures";
import { numberSplitCombine, timeSplitCombine } from "../models/split/split.fixtures";
import { LINE_CHART_MANIFEST } from "./line-chart/line-chart";

const totals = EssenceFixtures
  .wikiTotals()
  .addSeries(measureSeries("added"));

const emptyLineChart = EssenceFixtures
  .wikiTotals()
  .set("visualization", LINE_CHART_MANIFEST as any)
  .addSeries(measureSeries("added"));

const timeLineChart = EssenceFixtures
  .wikiTotals()
  .addSeries(measureSeries("added"))
  .addSplit(timeSplitCombine("time"), VisStrategy.FairGame);

describe("Visualization Manifests", () => {
  describe("Bar Chart", () => {
    it("should switch to bar chart with single number split", () => {
      const essence = totals.addSplit(
        numberSplitCombine("commentLength"),
        VisStrategy.FairGame
      );

      expect(essence.visResolve.state).to.be.equal("ready");
      expect(essence.visualization.name).to.be.equal("bar-chart");
    });
  });

  describe("Line Chart", () => {
    describe("Starting from Totals", () => {
      it("should switch to line chart with single time split", () => {
        const essence = totals.addSplit(
          timeSplitCombine("time"),
          VisStrategy.FairGame
        );

        expect(essence.visResolve.state).to.be.equal("ready");
        expect(essence.visualization.name).to.be.equal("line-chart");
      });
    });

    describe("Starting from Line Chart", () => {
      it("should stick to line chart with change to number split", () => {
        const essence = timeLineChart.changeSplit(
          numberSplitCombine("commentLength"),
          VisStrategy.FairGame
        );

        expect(essence.visResolve.state).to.be.equal("ready");
        expect(essence.visualization.name).to.be.equal("line-chart");
      });
    });

    describe("Starting from unresolved Line Chart", () => {
      it("should stick to line chart with single time split", () => {
        const essence = emptyLineChart.addSplit(
          timeSplitCombine("time"),
          VisStrategy.FairGame
        );

        expect(essence.visResolve.state).to.be.equal("ready");
        expect(essence.visualization.name).to.be.equal("line-chart");
      });

      it("should stick to line chart with single number split", () => {
        const essence = emptyLineChart.addSplit(
          numberSplitCombine("commentLength"),
          VisStrategy.FairGame
        );

        expect(essence.visResolve.state).to.be.equal("ready");
        expect(essence.visualization.name).to.be.equal("line-chart");
      });
    });
  });
});
