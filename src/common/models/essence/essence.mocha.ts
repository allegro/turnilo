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
import { testImmutableClass } from "immutable-class-tester";
import { $, RefExpression } from "plywood";
import { Highlight } from "..";
import { MANIFESTS } from "../../manifests";
import { BAR_CHART_MANIFEST } from "../../manifests/bar-chart/bar-chart";
import { LINE_CHART_MANIFEST } from "../../manifests/line-chart/line-chart";
import { TABLE_MANIFEST } from "../../manifests/table/table";
import { TOTALS_MANIFEST } from "../../manifests/totals/totals";
import { DataCube, Introspection } from "../data-cube/data-cube";
import { DataCubeFixtures } from "../data-cube/data-cube.fixtures";
import { HighlightFixtures } from "../highlight/highlight.fixtures";
import { MeasureFixtures } from "../measure/measure.fixtures";
import { SplitCombine } from "../split-combine/split-combine";
import { Splits } from "../splits/splits";
import { Essence, EssenceJS, VisStrategy } from "./essence";
import { EssenceFixtures } from "./essence.fixtures";

describe("Essence", () => {
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
    defaultFilter: { op: "literal", value: true },
    defaultSplits: "time",
    defaultDuration: "P3D",
    defaultSortMeasure: "count",
    defaultPinnedDimensions: ["twitterHandle"],
    refreshRule: {
      rule: "fixed",
      time: new Date("2015-09-13T00:00:00Z")
    }
  };

  var dataCube = DataCube.fromJS(dataCubeJS);

  var context = { dataCube, visualizations: MANIFESTS };

  it("is an immutable class", () => {
    testImmutableClass<EssenceJS>(Essence, [
      {
        visualization: "totals",
        timezone: "Etc/UTC",
        filter: {
          op: "literal",
          value: true
        },
        pinnedDimensions: [],
        singleMeasure: "count",
        selectedMeasures: [],
        splits: []
      },
      {
        visualization: "totals",
        timezone: "Etc/UTC",
        filter: $("twitterHandle").overlap(["A", "B", "C"]).toJS(),
        pinnedDimensions: ["twitterHandle"],
        pinnedSort: "count",
        singleMeasure: "count",
        selectedMeasures: ["count"],
        splits: []
      }
    ], { context });
  });

  describe("removes highlight when necessary", () => {
    const { lineChartWithAddedMeasure, lineChartWithAvgAddedMeasure, tableNoMeasure } = HighlightFixtures;

    const tests: Array<{ highlight: Highlight, expected: Highlight, description: string }> = [
      { highlight: lineChartWithAddedMeasure(), expected: lineChartWithAddedMeasure(), description: "is kept when measure is selected" },
      { highlight: tableNoMeasure(), expected: tableNoMeasure(), description: "is kept when contains no measure" },
      { highlight: lineChartWithAvgAddedMeasure(), expected: null, description: "is removed when measure is not selected" }
    ];

    tests.forEach(({ highlight, expected, description }) => {
      it(`highlight ${description}`, () => {
        const essenceValue = EssenceFixtures.wikiTable().valueOf();
        const essenceValueWithHighlight = { ...essenceValue, highlight };
        const essenceWithHighlight = new Essence(essenceValueWithHighlight);

        expect(essenceWithHighlight.highlight).to.deep.equal(expected);

      });
    });
  });

  describe("errors", () => {
    it("must have context", () => {
      expect(() => {
        Essence.fromJS({} as any);
      }).to.throw("must have context");
    });

  });

  describe("upgrades", () => {
    it("works in the base case", () => {
      var essence = Essence.fromJS({
        visualization: "totals",
        timezone: "Etc/UTC",
        pinnedDimensions: [],
        selectedMeasures: [],
        splits: []
      }, context);

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
          op: "overlap",
          operand: {
            name: "time",
            op: "ref"
          }
        },
        multiMeasureMode: true,
        pinnedDimensions: [],
        selectedMeasures: [],
        singleMeasure: "count",
        splits: [],
        timezone: "Etc/UTC",
        visualization: "totals"
      });
    });

    it("adds timezone", () => {
      var linkItem = Essence.fromJS({
        visualization: "totals",
        pinnedDimensions: ["statusCode"],
        selectedMeasures: ["count"],
        splits: [],
        filter: "true"
      }, context);

      expect(linkItem.toJS()).to.deep.equal({
        filter: {
          op: "literal",
          value: true
        },
        multiMeasureMode: true,
        pinnedDimensions: [],
        singleMeasure: "count",
        selectedMeasures: [
          "count"
        ],
        splits: [],
        timezone: "Etc/UTC",
        visualization: "totals"
      });
    });

  });

  describe(".fromDataCube", () => {
    it("works in the base case", () => {
      var essence = Essence.fromDataCube(dataCube, context);

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
          op: "overlap",
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
        visualization: "line-chart"
      });
    });

  });

  describe("vis picking", () => {

    describe("#getBestVisualization", () => {
      const tests = [
        { splitDimensions: [], current: null, expected: TOTALS_MANIFEST },
        { splitDimensions: ["tweetLength"], current: TOTALS_MANIFEST, expected: BAR_CHART_MANIFEST },
        { splitDimensions: ["twitterHandle"], current: TOTALS_MANIFEST, expected: TABLE_MANIFEST },
        { splitDimensions: ["time"], current: BAR_CHART_MANIFEST, expected: LINE_CHART_MANIFEST }
      ];
      const dimensions = DataCubeFixtures.twitter().dimensions;

      tests.forEach(({ splitDimensions, current, expected }) => {
        it(`chooses ${expected.name} given splits: [${splitDimensions}] with current ${current && current.name}`, () => {
          const { visualization } = Essence.getBestVisualization(
            MANIFESTS,
            DataCubeFixtures.twitter(),
            Splits.fromJS(splitDimensions, { dimensions }),
            null,
            current);

          expect(visualization).to.deep.equal(expected);
        });
      });
    });

    describe("#changeSplits", () => {
      let essence: Essence = null;
      beforeEach(() => essence = EssenceFixtures.twitterNoVisualisation());

      const timeSplit = SplitCombine.fromJS({ expression: { op: "ref", name: "time" } });
      const tweetLengthSplit = SplitCombine.fromJS({ expression: { op: "ref", name: "tweetLength" } });
      const twitterHandleSplit = SplitCombine.fromJS({ expression: { op: "ref", name: "twitterHandle" } });

      it("defaults to bar chart with numeric dimension and is sorted on self", () => {
        essence = essence.addSplit(tweetLengthSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(BAR_CHART_MANIFEST);
        expect((essence.splits.get(0).sortAction.expression as RefExpression).name).to.deep.equal("tweetLength");
        expect(essence.visResolve.isReady()).to.be.true;
      });

      it("defaults to table with non continuous dimension", () => {
        essence = essence.changeVisualization(TOTALS_MANIFEST);
        essence = essence.addSplit(twitterHandleSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(TABLE_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;
      });

      it("defaults to line chart with a continuous dimension", () => {
        essence = essence.changeVisualization(TOTALS_MANIFEST);
        essence = essence.addSplit(timeSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(LINE_CHART_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;
      });

      it("in fair game, adding a string split to time split results in line chart", () => {
        essence = essence.addSplit(timeSplit, VisStrategy.FairGame);
        essence = essence.addSplit(twitterHandleSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(LINE_CHART_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;
      });

      it("in unfair game, gives existing vis a bonus", () => {
        essence = essence.addSplit(timeSplit, VisStrategy.FairGame);
        essence = essence.changeVisualization(BAR_CHART_MANIFEST);
        expect(essence.visualization).to.deep.equal(BAR_CHART_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;
        essence = essence.addSplit(twitterHandleSplit, VisStrategy.UnfairGame);
        expect(essence.visualization).to.deep.equal(BAR_CHART_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;
      });

      it("defaults back to totals with no split", () => {
        essence = essence.changeVisualization(TOTALS_MANIFEST);
        essence = essence.addSplit(timeSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(LINE_CHART_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;

        essence = essence.removeSplit(essence.splits.first(), VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(TOTALS_MANIFEST);
        expect(essence.visResolve.isReady()).to.be.true;
      });

      const noMeasuresTests = [
        { splits: [timeSplit], visualization: LINE_CHART_MANIFEST },
        { splits: [tweetLengthSplit], visualization: BAR_CHART_MANIFEST },
        { splits: [twitterHandleSplit], visualization: TABLE_MANIFEST }
      ];

      noMeasuresTests.forEach(({ splits, visualization }) => {
        it(`does not change ${visualization.title} visualization when in manual resolve`, () => {
          essence = essence.changeVisualization(TOTALS_MANIFEST);
          essence = essence.addSplit(splits[0], VisStrategy.FairGame);
          expect(essence.visualization).to.deep.equal(visualization);
          expect(essence.visResolve.isReady()).to.be.true;

          essence = essence.toggleSelectedMeasure(MeasureFixtures.twitterCount());
          expect(essence.visualization).to.deep.equal(visualization);
          expect(essence.visResolve.isManual()).to.be.true;

          essence = essence.removeSplit(essence.splits.first(), VisStrategy.FairGame);
          expect(essence.visualization).to.deep.equal(visualization);
          expect(essence.visResolve.isManual()).to.be.true;

          essence = essence.toggleSelectedMeasure(MeasureFixtures.twitterCount());
          expect(essence.visualization).to.deep.equal(visualization);
          expect(essence.visResolve.isManual()).to.be.true;
        });
      });

      it("falls back when can't handle measures", () => {
        // todo
      });
    });

    describe("#changeVisualisation", () => {
      let essence: Essence = null;
      beforeEach(() => essence = EssenceFixtures.twitterNoVisualisation());

      [TABLE_MANIFEST, LINE_CHART_MANIFEST, BAR_CHART_MANIFEST].forEach(manifest => {
        it("it sets visResolve to manual", () => {
          essence = essence.changeVisualization(manifest);
          expect(essence.visualization.name).to.deep.equal(manifest.name);
          expect(essence.visResolve.isManual()).to.be.true;
        });
      });
    });

  });
});
