'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';
import { List } from 'immutable';

import { $, Expression } from 'plywood';
import { Essence } from './essence';
import { DataSource } from "../data-source/data-source";

describe('Essence', () => {
  var dataSourceJS = {
    name: 'twitter',
    title: 'Twitter',
    engine: 'druid',
    source: 'twitter',
    introspection: 'none',
    dimensions: [{
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
    defaultSortMeasure: 'rows',
    defaultPinnedDimensions: ['tweet'],
    refreshRule: {
      refresh: "PT1M",
      rule: "fixed"
    }
  };

  var dataSource = DataSource.fromJS(dataSourceJS);
  var dataSources: any[] = [];
  dataSources.push(dataSource);

  var visualizationsArray = [
    {
      id: 'viz1',
      title: 'viz1',
      handleCircumstance(): any {
        return { 'isAutomatic': () => false };
      }
    }
  ];
  it('is an immutable class', () => {
    testImmutableClass(Essence, [
      {
        dataSource: 'twitter',
        visualization: 'viz1',
        timezone: 'Etc/UTC',
        filter: {
          op: "literal",
          value: true

        },
        pinnedDimensions: [],
        selectedMeasures: [],
        splits: []
      }], {
      context: {
        dataSources: List(<any> dataSources),
        visualizations: List(<any> visualizationsArray)
      }
    });
  });
});
