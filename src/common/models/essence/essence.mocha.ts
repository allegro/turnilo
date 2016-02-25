import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';
import { List } from 'immutable';

import { $, Expression } from 'plywood';
import { Essence, EssenceJS } from './essence';
import { DataSource } from "../data-source/data-source";

describe('Essence', () => {
  var dataSourceJS = {
    name: 'twitter',
    title: 'Twitter',
    engine: 'druid',
    source: 'twitter',
    introspection: 'none',
    dimensions: [
      {
        expression: {
          name: 'time',
          op: 'ref'
        },
        kind: 'time',
        name: 'time',
        title: 'Time'
      },
      {
        expression: {
          name: 'twitterHandle',
          op: 'ref'
        },
        kind: 'string',
        name: 'twitterHandle',
        title: 'Twitter Handle'
      }
    ],
    measures: [
      {
        name: 'count',
        title: 'count',
        expression: {
          name: 'count',
          op: 'ref'
        }

      }
    ],
    timeAttribute: 'time',
    defaultTimezone: 'Etc/UTC',
    defaultFilter: { op: 'literal', value: true },
    defaultDuration: 'P3D',
    defaultSortMeasure: 'count',
    defaultPinnedDimensions: ['twitterHandle'],
    refreshRule: {
      refresh: "PT1M",
      rule: "fixed"
    }
  };

  var dataSource = DataSource.fromJS(dataSourceJS);

  var visualizations: any = List([
    {
      id: 'vis1',
      title: 'vis1',
      handleCircumstance(): any {
        return { 'isAutomatic': () => false };
      }
    }
  ]);

  var context = { dataSource, visualizations };

  it('is an immutable class', () => {
    testImmutableClass<EssenceJS>(Essence, [
      {
        visualization: 'vis1',
        timezone: 'Etc/UTC',
        filter: {
          op: "literal",
          value: true

        },
        pinnedDimensions: [],
        selectedMeasures: [],
        splits: []
      },
      {
        visualization: 'vis1',
        timezone: 'Etc/UTC',
        filter: {
          op: "literal",
          value: true

        },
        pinnedDimensions: ['twitterHandle'],
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


  describe('.fromDataSource', () => {
    it('works in the base case', () => {
      var essence = Essence.fromDataSource(dataSource, context);

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
        "selectedMeasures": [
          "count"
        ],
        "splits": [],
        "timezone": "Etc/UTC",
        "visualization": "vis1"
      });
    });

  });


  describe('.toHash / #fromHash', () => {
    it("is symmetric", () => {
      var essence1 = Essence.fromJS({
        visualization: 'vis1',
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
});
