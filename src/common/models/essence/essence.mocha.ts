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
import { MANIFESTS } from "../../manifests";
import { BAR_CHART_MANIFEST } from "../../manifests/bar-chart/bar-chart";
import { LINE_CHART_MANIFEST } from "../../manifests/line-chart/line-chart";
import { TABLE_MANIFEST } from "../../manifests/table/table";
import { TOTALS_MANIFEST } from "../../manifests/totals/totals";
import { DataCube, Introspection } from "../data-cube/data-cube";
import { DataCubeFixtures } from "../data-cube/data-cube.fixtures";
import { Highlight } from "../highlight/highlight";
import { HighlightFixtures } from "../highlight/highlight.fixtures";
import { MeasureFixtures } from "../measure/measure.fixtures";
import { SeriesList } from "../series-list/series-list";
import { MeasureSeries } from "../series/measure-series";
import { Split, SplitType } from "../split/split";
import { Splits } from "../splits/splits";
import { Essence, VisStrategy } from "./essence";
import { EssenceFixtures } from "./essence.fixtures";

describe("EssenceProps", () => {
  var dataCubeJS = {
    name: "twitter",
    title: "Twitter",
    clusterName: "druid",
    source: "twitter",
    introspection: ("none" as Introspection),
    dimensions: [
      {
        kind: "time",
        name: "time",
        title: "Time",
        formula: "$time"
      },
      {
        kind: "string",
        name: "twitterHandle",
        title: "Twitter Handle",
        formula: "$twitterHandle"
      }
    ],
    measures: [
      {
        name: "count",
        title: "count",
        formula: "$main.count()"
      }
    ],
    timeAttribute: "time",
    defaultTimezone: "Etc/UTC",
    defaultSplits: "time",
    defaultDuration: "P3D",
    defaultSortMeasure: "count",
    defaultPinnedDimensions: ["twitterHandle"],
    refreshRule: {
      rule: "fixed",
      time: new Date("2015-09-13T00:00:00Z")
    }
  };

  const dataCube = DataCube.fromJS(dataCubeJS);

  const context = { dataCube, visualizations: MANIFESTS };

  describe("removes highlight when necessary", () => {
    const { lineChartWithAddedMeasure, lineChartWithAvgAddedMeasure, tableNoMeasure } = HighlightFixtures;

    const tests: Array<{ highlight: Highlight, expected: Highlight, description: string }> = [
      { highlight: lineChartWithAddedMeasure(), expected: lineChartWithAddedMeasure(), description: "is kept when measure is selected" },
      { highlight: tableNoMeasure(), expected: tableNoMeasure(), description: "is kept when contains no measure" },
      { highlight: lineChartWithAvgAddedMeasure(), expected: null, description: "is removed when measure is not selected" }
    ];

    tests.forEach(({ highlight, expected, description }) => {
      it(`highlight ${description}`, () => {
        const wikiEssence = EssenceFixtures.wikiTable();
        const essenceWithHighlight = wikiEssence.changeHighlight(highlight);

        expect(essenceWithHighlight.highlight).to.deep.equal(expected);

      });
    });
  });

  describe(".fromDataCube", () => {
    it.skip("works in the base case", () => {
      const essence = Essence.fromDataCube(dataCube, context);

      // TODO: don't test toJS
      expect(essence.toJS()).to.deep.equal({
        filter: {
          expression: {
            op: "timeRange",
            duration: "P3D",
            step: -1,
            operand: {
              name: "m",
              op: "ref"
            }
          },
          op: "OVERLAP",
          operand: {
            name: "time",
            op: "ref"
          }
        },
        pinnedDimensions: [
          "twitterHandle"
        ],
        pinnedSort: "count",
        singleMeasure: "count",
        selectedMeasures: [
          "count"
        ],
        splits: [
          {
            bucketAction: {
              op: "timeBucket",
              duration: "PT1H"
            },
            expression: {
              name: "time",
              op: "ref"
            },
            sortAction: {
              op: "sort",
              direction: "ascending",
              expression: {
                name: "time",
                op: "ref"
              }
            }
          }
        ],
        timezone: "Etc/UTC",
        visualization: LINE_CHART_MANIFEST
      });
    });

  });

  describe("vis picking", () => {

    describe("#getBestVisualization", () => {
      const tests = [
        { splitDimensions: [], current: null, expected: TOTALS_MANIFEST },
        { splitDimensions: [{ reference: "tweetLength", type: SplitType.number }], current: TOTALS_MANIFEST, expected: BAR_CHART_MANIFEST },
        { splitDimensions: [{ reference: "twitterHandle", type: SplitType.string }], current: TOTALS_MANIFEST, expected: TABLE_MANIFEST },
        { splitDimensions: [{ reference: "time", type: SplitType.time }], current: BAR_CHART_MANIFEST, expected: LINE_CHART_MANIFEST }
      ];

      tests.forEach(({ splitDimensions, current, expected }) => {
        it(`chooses ${expected.name} given splits: [${splitDimensions}] with current ${current && current.name}`, () => {
          const { visualization } = Essence.getBestVisualization(
            MANIFESTS,
            DataCubeFixtures.twitter(),
            Splits.fromJS(splitDimensions),
            SeriesList.fromMeasureNames([]),
            null,
            current);

          expect(visualization).to.deep.equal(expected);
        });
      });
    });

    describe("#changeSplits", () => {
      const timeSplit = Split.fromJS({ type: SplitType.time, reference: "time" });
      const tweetLengthSplit = Split.fromJS({ type: SplitType.number, reference: "tweetLength" });
      const twitterHandleSplit = Split.fromJS({ type: SplitType.string, reference: "twitterHandle" });

      it("defaults to bar chart with numeric dimension and is sorted on self", () => {
        const essence = EssenceFixtures.twitterNoVisualisation().addSplit(tweetLengthSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(BAR_CHART_MANIFEST);
        expect(essence.splits.splits.get(0).sort.reference).to.equal("tweetLength");
        expect(essence.visResolve.isReady()).to.be.true;
      });

      it("defaults to table with non continuous dimension", () => {
        const essence = EssenceFixtures.twitterNoVisualisation()
          .changeVisualization(TOTALS_MANIFEST)
          .addSplit(twitterHandleSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(TABLE_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;
      });

      it("defaults to line chart with a continuous dimension", () => {
        const essence = EssenceFixtures.twitterNoVisualisation()
          .changeVisualization(TOTALS_MANIFEST)
          .addSplit(timeSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(LINE_CHART_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;
      });

      it("in fair game, adding a string split to time split results in line chart", () => {
        const essence = EssenceFixtures.twitterNoVisualisation()
          .addSplit(timeSplit, VisStrategy.FairGame)
          .addSplit(twitterHandleSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(LINE_CHART_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;
      });

      it("in unfair game, gives existing vis a bonus", () => {
        const essence = EssenceFixtures.twitterNoVisualisation()
          .addSplit(timeSplit, VisStrategy.FairGame)
          .changeVisualization(BAR_CHART_MANIFEST);
        expect(essence.visualization).to.deep.equal(BAR_CHART_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;
        const newSplit = essence.addSplit(twitterHandleSplit, VisStrategy.UnfairGame);
        expect(newSplit.visualization).to.deep.equal(BAR_CHART_MANIFEST);
        expect(newSplit.visResolve.isReady()).to.be.true;
      });

      it("defaults back to totals with no split", () => {
        const essence = EssenceFixtures.twitterNoVisualisation()
          .changeVisualization(TOTALS_MANIFEST)
          .addSplit(timeSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(LINE_CHART_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;

        const withoutSplit = essence.removeSplit(essence.splits.splits.first(), VisStrategy.FairGame);
        expect(withoutSplit.visualization).to.deep.equal(TOTALS_MANIFEST);
        expect(withoutSplit.visResolve.isReady()).to.be.true;
      });

      const noMeasuresTests = [
        { splits: [timeSplit], visualization: LINE_CHART_MANIFEST },
        { splits: [tweetLengthSplit], visualization: BAR_CHART_MANIFEST },
        { splits: [twitterHandleSplit], visualization: TABLE_MANIFEST }
      ];

      noMeasuresTests.forEach(({ splits, visualization }) => {
        it(`does not change ${visualization.title} visualization when in manual resolve`, () => {
          const essence = EssenceFixtures.twitterNoVisualisation()
            .changeVisualization(TOTALS_MANIFEST)
            .addSplit(splits[0], VisStrategy.FairGame);
          expect(essence.visualization).to.deep.equal(visualization);
          expect(essence.visResolve.isReady(), "is ready after adding split").to.be.true;

          const toggledMeasure = essence.removeSeries(essence.series.series.first());
          expect(toggledMeasure.visualization).to.deep.equal(visualization);
          expect(toggledMeasure.visResolve.isManual(), "is manual after removing selected measure").to.be.true;

          const withoutSplit = toggledMeasure.removeSplit(toggledMeasure.splits.splits.first(), VisStrategy.FairGame);
          expect(withoutSplit.visualization).to.deep.equal(visualization);
          expect(withoutSplit.visResolve.isManual(), "is manual after removing split").to.be.true;

          const toggledAgain = withoutSplit.addSeries(MeasureSeries.fromMeasure(MeasureFixtures.twitterCount()));
          expect(toggledAgain.visualization).to.deep.equal(visualization);
          expect(toggledAgain.visResolve.isManual(), "is manual after second toggle").to.be.true;
        });
      });

      it("falls back when can't handle measures", () => {
        // todo
      });

      it("should handle adding too many splits for table", () => {
        const essence = EssenceFixtures.wikiTable();
        const addedSplit = essence.addSplit(timeSplit, VisStrategy.KeepAlways);

        expect(addedSplit.splits.length()).to.be.eq(5);
        expect(addedSplit.visResolve.isManual()).to.be.true;
        expect(addedSplit.visResolve.resolutions[0].adjustment.splits.length()).to.be.eq(4);
      });
    });

    describe("#changeVisualisation", () => {
      [TABLE_MANIFEST, LINE_CHART_MANIFEST, BAR_CHART_MANIFEST].forEach(manifest => {
        it("it sets visResolve to manual", () => {
          const essence = EssenceFixtures.twitterNoVisualisation().changeVisualization(manifest);
          expect(essence.visualization.name).to.deep.equal(manifest.name);
          expect(essence.visResolve.isManual()).to.be.true;
        });
      });
    });

  });
});
