import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';
import { List } from 'immutable';

import { $, Expression } from 'plywood';
import { DataSource } from "../data-source/data-source";
import { LinkViewConfig } from './link-view-config';

describe('LinkViewConfig', () => {
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
    testImmutableClass(LinkViewConfig, [
      {
        title: 'The Links Will Rise Again!',
        linkItems: [
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
              singleMeasure: "count",
              selectedMeasures: ['count'],
              splits: []
            }
          }
        ]
      }
    ], { context });
  });

});
