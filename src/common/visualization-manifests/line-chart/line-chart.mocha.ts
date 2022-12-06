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

import { expect, use } from "chai";
import { VisStrategy } from "../../models/essence/essence";
import { measureSeries } from "../../models/series/series.fixtures";
import { numberSplitCombine, timeSplitCombine } from "../../models/split/split.fixtures";
import { totals, visualizationManifestResolvers } from "../test-utils";
import { LINE_CHART_MANIFEST } from "./line-chart";

use(visualizationManifestResolvers);

const emptyLineChart = totals
  .set("visualization", LINE_CHART_MANIFEST as any)
  .addSeries(measureSeries("added"));

const timeLineChart = totals
  .addSeries(measureSeries("added"))
  .addSplit(timeSplitCombine("time"), VisStrategy.FairGame);

describe("Visualization Manifests", () => {
  describe("Line Chart", () => {
    describe("Starting from Totals", () => {
      it("should switch to line chart with single time split", () => {
        const essence = totals.addSplit(
          timeSplitCombine("time"),
          VisStrategy.FairGame
        );

        expect(essence).to.be.resolvedTo("line-chart");
      });
    });

    describe("Starting from Line Chart", () => {
      it("should stick to line chart with change to number split", () => {
        const essence = timeLineChart.changeSplit(
          numberSplitCombine("commentLength"),
          VisStrategy.FairGame
        );

        expect(essence).to.be.resolvedTo("line-chart");
      });
    });

    describe("Starting from unresolved Line Chart", () => {
      it("should stick to line chart with single time split", () => {
        const essence = emptyLineChart.addSplit(
          timeSplitCombine("time"),
          VisStrategy.FairGame
        );

        expect(essence).to.be.resolvedTo("line-chart");
      });

      it("should stick to line chart with single number split", () => {
        const essence = emptyLineChart.addSplit(
          numberSplitCombine("commentLength"),
          VisStrategy.FairGame
        );

        expect(essence).to.be.resolvedTo("line-chart");
      });
    });
  });
});
