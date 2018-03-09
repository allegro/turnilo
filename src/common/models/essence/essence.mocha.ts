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

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class-tester';

import { $ } from 'plywood';
import { MANIFESTS } from "../../manifests";
import { LINE_CHART_MANIFEST } from "../../manifests/line-chart/line-chart";
import { TABLE_MANIFEST } from "../../manifests/table/table";
import { Essence, EssenceJS, VisStrategy } from './essence';
import { DataCube, Introspection } from "../data-cube/data-cube";
import { DataCubeMock } from "../data-cube/data-cube.mock";
import { TOTALS_MANIFEST } from "../../manifests/totals/totals";
import { Splits } from "../splits/splits";
import { BAR_CHART_MANIFEST } from "../../manifests/bar-chart/bar-chart";
import { SplitCombine } from "../split-combine/split-combine";
import { RefExpression } from "plywood";
import { EssenceMock } from "./essence.mock";

describe('Essence', () => {
  var dataCubeJS = {
    name: 'twitter',
    title: 'Twitter',
    clusterName: 'druid',
    source: 'twitter',
    introspection: ('none' as Introspection),
    dimensions: [
      {
        kind: 'time',
        name: 'time',
        title: 'Time',
        formula: '$time'
      },
      {
        kind: 'string',
        name: 'twitterHandle',
        title: 'Twitter Handle',
        formula: '$twitterHandle'
      }
    ],
    measures: [
      {
        name: 'count',
        title: 'count',
        formula: '$main.count()'
      }
    ],
    timeAttribute: 'time',
    defaultTimezone: 'Etc/UTC',
    defaultFilter: { op: 'literal', value: true },
    defaultSplits: 'time',
    defaultDuration: 'P3D',
    defaultSortMeasure: 'count',
    defaultPinnedDimensions: ['twitterHandle'],
    refreshRule: {
      rule: "fixed",
      time: new Date('2015-09-13T00:00:00Z')
    }
  };

  var dataCube = DataCube.fromJS(dataCubeJS);

  var context = { dataCube, visualizations: MANIFESTS };

  it('is an immutable class', () => {
    testImmutableClass<EssenceJS>(Essence, [
      {
        visualization: 'totals',
        timezone: 'Etc/UTC',
        filter: {
          op: "literal",
          value: true
        },
        pinnedDimensions: [],
        singleMeasure: 'count',
        selectedMeasures: [],
        splits: []
      },
      {
        visualization: 'totals',
        timezone: 'Etc/UTC',
        filter: $('twitterHandle').overlap(['A', 'B', 'C']).toJS(),
        pinnedDimensions: ['twitterHandle'],
        singleMeasure: 'count',
        selectedMeasures: ['count'],
        splits: []
      }
    ], { context });
  });


  describe('errors', () => {
    it('must have context', () => {
      expect(() => {
        Essence.fromJS({} as any);
      }).to.throw('must have context');
    });

  });


  describe('upgrades', () => {
    it('works in the base case', () => {
      var essence = Essence.fromJS({
        visualization: 'totals',
        timezone: 'Etc/UTC',
        pinnedDimensions: [],
        selectedMeasures: [],
        splits: []
      }, context);

      expect(essence.toJS()).to.deep.equal({
        "filter": {
          "expression": {
            "op": "timeRange",
            "duration": "P3D",
            "step": -1,
            "operand": {
              "name": "m",
              "op": "ref"
            }
          },
          "op": "overlap",
          "operand": {
            "name": "time",
            "op": "ref"
          }
        },
        "multiMeasureMode": true,
        "pinnedDimensions": [],
        "selectedMeasures": [],
        "singleMeasure": "count",
        "splits": [],
        "timezone": "Etc/UTC",
        "visualization": "totals"
      });
    });

    it('adds timezone', () => {
      var linkItem = Essence.fromJS({
        visualization: 'totals',
        pinnedDimensions: ['statusCode'],
        selectedMeasures: ['count'],
        splits: [],
        filter: 'true'
      }, context);

      expect(linkItem.toJS()).to.deep.equal({
        "filter": {
          "op": "literal",
          "value": true
        },
        "multiMeasureMode": true,
        "pinnedDimensions": [],
        "singleMeasure": "count",
        "selectedMeasures": [
          "count"
        ],
        "splits": [],
        "timezone": "Etc/UTC",
        "visualization": "totals"
      });
    });

    it('handles time series', () => {
      var hashNoVis = "2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gA2AlmAKYBOAhgSsAG7UCupeY5zAvsgNoC6ybZsmAQMjAHZgU3EWMnB+MsAHcSZcgAlK4gCYEW/cYwIEgA=";

      var timeSeriesHash = `time-series/${hashNoVis}`;
      var lineChartHash = `line-chart/${hashNoVis}`;
      var barChartHash = `bar-chart/${hashNoVis}`;

      var timeSeries = Essence.fromHash(timeSeriesHash, context);
      var lineChart = Essence.fromHash(lineChartHash, context);
      var barChart = Essence.fromHash(barChartHash, context);

      expect(timeSeries.visualization).to.equal(lineChart.visualization);
      expect(timeSeries.visualization).to.not.equal(barChart.visualization);

    });

  });


  describe('.fromDataCube', () => {
    it('works in the base case', () => {
      var essence = Essence.fromDataCube(dataCube, context);

      expect(essence.toJS()).to.deep.equal({
        "filter": {
          "expression": {
            "op": "timeRange",
            "duration": "P3D",
            "step": -1,
            "operand": {
              "name": "m",
              "op": "ref"
            }
          },
          "op": "overlap",
          "operand": {
            "name": "time",
            "op": "ref"
          }
        },
        "pinnedDimensions": [
          "twitterHandle"
        ],
        "singleMeasure": "count",
        "selectedMeasures": [
          "count"
        ],
        "splits": [
          {
            "bucketAction": {
              "op": "timeBucket",
              "duration": "PT1H"
            },
            "expression": {
              "name": "time",
              "op": "ref"
            },
            "sortAction": {
              "op": "sort",
              "direction": "ascending",
              "expression": {
                "name": "time",
                "op": "ref"
              }
            }
          }
        ],
        "timezone": "Etc/UTC",
        "visualization": "line-chart"
      });
    });

  });


  describe('.toHash / #fromHash', () => {
    it("is symmetric", () => {
      var essence1 = Essence.fromJS({
        visualization: 'totals',
        timezone: 'Etc/UTC',
        filter: {
          op: "literal",
          value: true

        },
        pinnedDimensions: ['twitterHandle'],
        selectedMeasures: ['count'],
        splits: []
      }, context);

      var hash = essence1.toHash();
      var essence2 = Essence.fromHash(hash, context);

      expect(essence1.toJS()).to.deep.equal(essence2.toJS());
    });
  });

  describe('vis picking', () => {

    describe("#getBestVisualization", () => {
      const tests = [
        { splitDimensions: [], current: null, expected: TOTALS_MANIFEST},
        { splitDimensions: ['tweetLength'], current: TOTALS_MANIFEST, expected: BAR_CHART_MANIFEST},
        { splitDimensions: ['twitterHandle'], current: TOTALS_MANIFEST, expected: TABLE_MANIFEST},
        { splitDimensions: ['time'], current: BAR_CHART_MANIFEST, expected: LINE_CHART_MANIFEST}
      ];
      const dimensions = DataCubeMock.twitter().dimensions;

      tests.forEach(({ splitDimensions, current, expected }) => {
        it(`chooses ${expected.name} given splits: [${splitDimensions}] with current ${current && current.name}`, () => {
          const { visualization } = Essence.getBestVisualization(
            MANIFESTS,
            DataCubeMock.twitter(),
            Splits.fromJS(splitDimensions, { dimensions }),
            null,
            current);

          expect(visualization).to.deep.equal(expected);
        });
      });
    });

    describe("#changeSplits", () => {
      let essence: Essence = null;
      beforeEach(() => essence = EssenceMock.twitterNoVisualisation());

      const timeSplit = SplitCombine.fromJS({expression: { op: 'ref', name: 'time' }});
      const tweetLengthSplit = SplitCombine.fromJS({expression: { op: 'ref', name: 'tweetLength' }});
      const twitterHandleSplit = SplitCombine.fromJS({expression: { op: 'ref', name: 'twitterHandle' }});

      it("defaults to bar chart with numeric dimension and is sorted on self", () => {
        essence = essence.addSplit(tweetLengthSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(BAR_CHART_MANIFEST);
        expect((essence.splits.get(0).sortAction.expression as RefExpression).name).to.deep.equal('tweetLength');
        expect(essence.visResolve.isReady()).to.be.true;
      });

      it("defaults to table with non numeric dimension", () => {
        essence = essence.changeVisualization(TOTALS_MANIFEST);
        essence = essence.addSplit(twitterHandleSplit, VisStrategy.FairGame);
        expect(essence.visualization).to.deep.equal(TABLE_MANIFEST);
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

      it("falls back when can't handle measures", () => {
        // todo
      });
    });

    describe("#changeVisualisation", () => {
      let essence: Essence = null;
      beforeEach(() => essence = EssenceMock.twitterNoVisualisation());

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
