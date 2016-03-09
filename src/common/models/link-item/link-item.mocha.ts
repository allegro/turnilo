import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';
import { List } from 'immutable';

import { $, Expression } from 'plywood';
import { LinkItem } from './link-item';
import { DataSource } from "../data-source/data-source";

describe('LinkItem', () => {
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
        name: 'time'
      },
      {
        expression: '$statusCode',
        kind: 'string',
        name: 'statusCode'
      }
    ],
    measures: [
      {
        name: 'count',
        expression: '$main.count()'
      },
      {
        name: 'uniqueIp',
        expression: '$main.countDistinct($ip)'
      }
    ],
    timeAttribute: 'time',
    defaultTimezone: 'Etc/UTC',
    defaultFilter: { op: 'literal', value: true },
    defaultDuration: 'P3D',
    defaultSortMeasure: 'count',
    refreshRule: {
      rule: "fixed",
      time: new Date('2015-09-13T00:00:00Z')
    }
  };

  var dataSources = List([DataSource.fromJS(dataSourceJS)]);

  var visualizations: any = List([
    {
      id: 'vis1',
      title: 'vis1',
      handleCircumstance(): any {
        return { 'isAutomatic': () => false };
      }
    }
  ]);

  var context = { dataSources, visualizations };

  it('is an immutable class', () => {
    testImmutableClass(LinkItem, [
      {
        name: 'test1',
        title: 'Test One',
        description: 'I like testing',
        group: 'Tests',
        dataSource: 'twitter',
        essence: {
          visualization: 'vis1',
          timezone: 'Etc/UTC',
          filter: {
            op: "literal",
            value: true
          },
          pinnedDimensions: ['statusCode'],
          selectedMeasures: ['count'],
          splits: []
        }
      },
      {
        name: 'test1',
        title: 'Test One',
        description: 'I like testing',
        group: 'Tests',
        dataSource: 'twitter',
        essence: {
          visualization: 'vis1',
          timezone: 'Etc/UTC',
          filter: {
            op: "literal",
            value: true
          },
          pinnedDimensions: ['statusCode'],
          selectedMeasures: ['count', 'uniqueIp'],
          splits: []
        }
      }
    ], { context });
  });


  describe('errors', () => {
    it('must have context', () => {
      expect(() => {
        LinkItem.fromJS({} as any);
      }).to.throw('must have context');
    });

  });

  describe('upgrades', () => {
    it('must add filter and timezone', () => {
      var linkItem = LinkItem.fromJS({
        name: 'test1',
        title: 'Test One',
        description: 'I like testing',
        group: 'Tests',
        dataSource: 'twitter',
        essence: {
          visualization: 'vis1',
          pinnedDimensions: ['statusCode'],
          selectedMeasures: ['count'],
          splits: 'time'
        }
      }, context);

      expect(linkItem.toJS()).to.deep.equal({
        "dataSource": "twitter",
        "description": "I like testing",
        "essence": {
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
            "statusCode"
          ],
          "selectedMeasures": [
            "count"
          ],
          "splits": [
            {
              "bucketAction": {
                "action": "timeBucket",
                "duration": "PT1H",
                "timezone": "Etc/UTC"
              },
              "expression": {
                "name": "time",
                "op": "ref"
              }
            }
          ],
          "timezone": "Etc/UTC",
          "visualization": "vis1"
        },
        "group": "Tests",
        "name": "test1",
        "title": "Test One"
      });
    });

  });

});
