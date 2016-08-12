/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { MANIFESTS } from "../../manifests/index";
import { Essence, EssenceJS, VisStrategy } from './essence';
import { DataCube, Introspection } from "../data-cube/data-cube";
import { DataCubeMock } from "../data-cube/data-cube.mock";
import { TOTALS_MANIFEST } from "../../manifests/totals/totals";
import { Splits } from "../splits/splits";
import { SplitCombineMock } from "../split-combine/split-combine.mock";
import { BAR_CHART_MANIFEST } from "../../manifests/bar-chart/bar-chart";
import { SplitCombine } from "../split-combine/split-combine";
import { RefExpression } from "plywood";

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
          "action": {
            "action": "in",
            "expression": {
              "action": {
                "action": "timeRange",
                "duration": "P3D",
                "step": -1
              },
              "expression": {
                "name": "m",
                "op": "ref"
              },
              "op": "chain"
            }
          },
          "expression": {
            "name": "time",
            "op": "ref"
          },
          "op": "chain"
        },
        "multiMeasureMode": true,
        "pinnedDimensions": [],
        "singleMeasure": "count",
        "selectedMeasures": [],
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
          "action": {
            "action": "in",
            "expression": {
              "action": {
                "action": "timeRange",
                "duration": "P3D",
                "step": -1
              },
              "expression": {
                "name": "m",
                "op": "ref"
              },
              "op": "chain"
            }
          },
          "expression": {
            "name": "time",
            "op": "ref"
          },
          "op": "chain"
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
              "action": "timeBucket",
              "duration": "PT1H"
            },
            "expression": {
              "name": "time",
              "op": "ref"
            },
            "sortAction": {
              "action": "sort",
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
      it("#getBestVisualization", () => {
        var dimensions = DataCubeMock.twitter().dimensions;
        var vis1 = Essence.getBestVisualization(MANIFESTS, DataCubeMock.twitter(), Splits.EMPTY, null, null);
        expect(vis1.visualization.name).to.deep.equal("totals");

        var vis2 = Essence.getBestVisualization(MANIFESTS, DataCubeMock.twitter(), Splits.fromJS(['tweetLength'], { dimensions }), null, TOTALS_MANIFEST);
        expect(vis2.visualization.name).to.deep.equal("bar-chart");

        var vis3 = Essence.getBestVisualization(MANIFESTS, DataCubeMock.twitter(), Splits.fromJS(['time'], { dimensions }), null, BAR_CHART_MANIFEST);
        expect(vis3.visualization.name).to.deep.equal("line-chart");
      });
    });

    describe("#changeSplits", () => {
      var essence: Essence = null;

      beforeEach(() => {
        essence = Essence.fromJS({
          visualization: null,
          timezone: 'Etc/UTC',
          pinnedDimensions: [],
          selectedMeasures: [],
          splits: []
        }, {
          dataCube: DataCubeMock.twitter(),
          visualizations: MANIFESTS
        });
      });


      var timeSplit = SplitCombine.fromJS({expression: { op: 'ref', name: 'time' }});
      var tweetLengthSplit = SplitCombine.fromJS({expression: { op: 'ref', name: 'tweetLength' }});
      var twitterHandleSplit = SplitCombine.fromJS({expression: { op: 'ref', name: 'twitterHandle' }});

      it("defaults to bar chart with numeric dimension and is sorted on self", () => {
        essence = essence.addSplit(tweetLengthSplit, VisStrategy.FairGame);
        expect(essence.visualization.name).to.deep.equal("bar-chart");
        expect((essence.splits.get(0).sortAction.expression as RefExpression).name).to.deep.equal('tweetLength');
        expect(essence.visResolve.state).to.deep.equal("ready");
      });

      it("defaults to line chart with a time split", () => {
        essence = essence.changeSplit(timeSplit, VisStrategy.FairGame);
        expect(essence.visualization.name).to.deep.equal("line-chart");
        expect(essence.visResolve.state).to.deep.equal("ready");
      });

      it("fall back with no splits", () => {
        essence = essence.changeVisualization(BAR_CHART_MANIFEST);
        expect(essence.visualization.name).to.deep.equal("bar-chart");
        expect(essence.visResolve.state).to.deep.equal("manual");
      });

      it("in fair game, adding a string split to time split results in line chart", () => {
        essence = essence.addSplit(timeSplit, VisStrategy.FairGame);
        essence = essence.addSplit(twitterHandleSplit, VisStrategy.FairGame);
        expect(essence.visualization.name).to.deep.equal("line-chart");
        expect(essence.visResolve.state).to.deep.equal("ready");
      });

      it("gives existing vis a bonus", () => {
        essence = essence.addSplit(timeSplit, VisStrategy.FairGame);
        essence = essence.changeVisualization(BAR_CHART_MANIFEST);
        expect(essence.visualization.name).to.deep.equal("bar-chart");
        expect(essence.visResolve.state).to.deep.equal("ready");
        essence = essence.addSplit(twitterHandleSplit, VisStrategy.UnfairGame);
        expect(essence.visualization.name).to.deep.equal("bar-chart");
        expect(essence.visResolve.state).to.deep.equal("ready");

      });

      it("falls back when can't handle measures", () => {
        // todo
      });

    });
  });
});
