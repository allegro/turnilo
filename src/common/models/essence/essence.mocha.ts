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
import { SinonSpy, spy, stub } from "sinon";
import { BAR_CHART_MANIFEST } from "../../visualization-manifests/bar-chart/bar-chart";
import { GRID_MANIFEST } from "../../visualization-manifests/grid/grid";
import { LINE_CHART_MANIFEST } from "../../visualization-manifests/line-chart/line-chart";
import { TABLE_MANIFEST } from "../../visualization-manifests/table/table";
import { TOTALS_MANIFEST } from "../../visualization-manifests/totals/totals";
import { clientAppSettings } from "../app-settings/app-settings.fixtures";
import { twitterClientDataCube } from "../data-cube/data-cube.fixtures";
import { TimeFilterPeriod } from "../filter-clause/filter-clause";
import { timePeriod } from "../filter-clause/filter-clause.fixtures";
import { Filter } from "../filter/filter";
import { MeasureFixtures } from "../measure/measure.fixtures";
import { SeriesList } from "../series-list/series-list";
import { MeasureSeries } from "../series/measure-series";
import { DimensionSort, SortDirection } from "../sort/sort";
import { Split, SplitType } from "../split/split";
import { Splits } from "../splits/splits";
import { TimeShift } from "../time-shift/time-shift";
import { VisualizationManifest } from "../visualization-manifest/visualization-manifest";
import { Essence, VisStrategy } from "./essence";
import { EssenceFixtures } from "./essence.fixtures";

describe("EssenceProps", () => {
  const dataCube = twitterClientDataCube;

  describe(".fromDataCube", () => {
    it.skip("works in the base case", () => {
      const essence = Essence.fromDataCube(dataCube, clientAppSettings);

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
      const series = [new MeasureSeries({ reference: "count" })];
      const tests = [
        {
          splits: [],
          series,
          current: null,
          expected: TOTALS_MANIFEST
        },
        {
          splits: [new Split({
            reference: "tweetLength",
            type: SplitType.number,
            sort: new DimensionSort({
              reference: "tweetLength"
            })
          })],
          series,
          current: TOTALS_MANIFEST,
          expected: BAR_CHART_MANIFEST
        },
        {
          splits: [new Split({
            reference: "twitterHandle",
            type: SplitType.string,
            sort: new DimensionSort({ reference: "twitterHandle" })
          })],
          series, current: TOTALS_MANIFEST,
          expected: GRID_MANIFEST
        },
        {
          splits: [new Split({
            reference: "time",
            type: SplitType.time,
            sort: new DimensionSort({ reference: "time", direction: SortDirection.ascending })
          })],
          series,
          current: null as VisualizationManifest,
          expected: LINE_CHART_MANIFEST
        }
      ];

      tests.forEach(({ splits, current, series, expected }) => {
        it(`chooses ${expected.name} given splits: [${splits}] with current ${current && current.name}`, () => {
          const { visualization } = Essence.getBestVisualization(
            clientAppSettings,
            twitterClientDataCube,
            Splits.fromSplits(splits),
            SeriesList.fromSeries(series),
            current);

          expect(visualization).to.deep.equal(expected);
        });
      });
    });

    describe("#changeSplits", () => {
      const timeSplit = new Split({
        type: SplitType.time,
        reference: "time",
        sort: new DimensionSort({ reference: "time" })
      });
      const tweetLengthSplit = new Split({
        type: SplitType.number,
        reference: "tweetLength",
        sort: new DimensionSort({ reference: "tweetLength" })
      });
      const twitterHandleSplit = new Split({
        type: SplitType.string,
        reference: "twitterHandle",
        sort: new DimensionSort({ reference: "twitterHandle" })
      });

      it("defaults to bar chart with numeric dimension and is sorted on self", () => {
        const essence = EssenceFixtures.twitterNoVisualisation().addSplit(tweetLengthSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(BAR_CHART_MANIFEST);
        expect(essence.splits.splits.get(0).sort.reference).to.equal("tweetLength");
        expect(essence.visResolve.isReady()).to.be.true;
      });

      it("defaults to grid with non continuous dimension", () => {
        const essence = EssenceFixtures.twitterNoVisualisation()
          .changeVisualization(TOTALS_MANIFEST)
          .addSplit(twitterHandleSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(GRID_MANIFEST);
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
        { splits: [twitterHandleSplit], visualization: GRID_MANIFEST }
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

          const toggledAgain = withoutSplit.addSeries(MeasureSeries.fromMeasure(MeasureFixtures.count()));
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
          const essence = EssenceFixtures.twitterNoVisualisation().changeVisualization(manifest as VisualizationManifest);
          expect(essence.visualization.name).to.deep.equal(manifest.name);
          expect(essence.visResolve.isManual()).to.be.true;
        });
      });
    });

    describe("constrain timeshift", () => {
      it("calls timeshift method with correct params", () => {
        const essence = EssenceFixtures.wikiTable();
        const timeFilterSpy = stub(essence, "timeFilter")
          .returns("stubbed-time-filter");
        const constrainToFilterSpy = stub(essence.timeShift, "constrainToFilter")
          .returns("constrained-time-shift");

        // @ts-ignore
        const newEssence = essence.constrainTimeShift();

        expect(timeFilterSpy.calledOnce).to.be.true;
        expect(constrainToFilterSpy.calledWith("stubbed-time-filter", essence.timezone)).to.be.true;
        expect(newEssence.timeShift).to.be.eq("constrained-time-shift");
      });

      describe("is called when", () => {
        let constrainTimeShiftSpy: SinonSpy;

        beforeEach(() => {
          // @ts-ignore
          constrainTimeShiftSpy = spy(Essence.prototype, "constrainTimeShift");
        });

        afterEach(() => {
          constrainTimeShiftSpy.restore();
        });

        it("changing filter", () => {
          const essence = EssenceFixtures.wikiTable();
          essence.changeFilter(Filter.fromClause(timePeriod("time", "P1W", TimeFilterPeriod.LATEST)));

          expect(constrainTimeShiftSpy.calledOnce).to.be.true;
        });

        it("changing time shift", () => {
          const essence = EssenceFixtures.wikiTable();
          essence.changeComparisonShift(TimeShift.fromJS("P1M"));

          expect(constrainTimeShiftSpy.calledOnce).to.be.true;
        });
      });
    });
  });
});
