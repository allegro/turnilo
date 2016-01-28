'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { DataSource, DataSourceJS } from './data-source';

describe('DataSource', () => {

  it('is an immutable class', () => {
    testImmutableClass<DataSourceJS>(DataSource, [
      {
        name: 'twitter',
        title: 'Twitter',
        engine: 'druid',
        source: 'twitter',
        subsetFilter: null,
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
      },
      {
        name: 'wiki',
        title: 'Wiki',
        engine: 'druid',
        source: 'wiki',
        subsetFilter: null,
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
              name: 'articleName',
              op: 'ref'
            },
            kind: 'string',
            name: 'articleName',
            title: 'Article Name'
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
      }
    ]);
  });

});
