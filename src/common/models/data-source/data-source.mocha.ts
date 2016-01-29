'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression, AttributeInfo } from 'plywood';
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
        defaultPinnedDimensions: ['articleName'],
        refreshRule: {
          refresh: "PT1M",
          rule: "fixed"
        }
      }
    ]);
  });


  describe("addAttributes", () => {
    it("works in basic case (no count)", () => {
      var dataSourceStub = DataSource.fromJS({
        name: 'wiki',
        title: 'Wiki',
        engine: 'druid',
        source: 'wiki',
        subsetFilter: null,
        introspection: 'autofill-all',
        timeAttribute: 'time',
        defaultTimezone: 'Etc/UTC',
        defaultFilter: { op: 'literal', value: true },
        defaultDuration: 'P3D',
        defaultSortMeasure: 'rows',
        defaultPinnedDimensions: [],
        refreshRule: {
          refresh: "PT1M",
          rule: "fixed"
        }
      });

      var attributes = [
        AttributeInfo.fromJS({ name: 'time', type: 'TIME' }),
        AttributeInfo.fromJS({ name: 'page', type: 'STRING' }),
        AttributeInfo.fromJS({ name: 'added', type: 'NUMBER' }),
        AttributeInfo.fromJS({ name: 'unique_user', special: 'unique' })
      ];

      expect(dataSourceStub.addAttributes(attributes).toJS()).to.deep.equal(
        {
          "defaultDuration": "P3D",
          "defaultFilter": {
            "op": "literal",
            "value": true
          },
          "defaultPinnedDimensions": [],
          "defaultSortMeasure": "rows",
          "defaultTimezone": "Etc/UTC",
          "dimensions": [
            {
              "expression": {
                "name": "time",
                "op": "ref"
              },
              "kind": "time",
              "name": "time",
              "title": "Time"
            },
            {
              "expression": {
                "name": "page",
                "op": "ref"
              },
              "kind": "string",
              "name": "page",
              "title": "Page"
            }
          ],
          "engine": "druid",
          "introspection": "no-autofill",
          "measures": [
            {
              "expression": {
                "action": {
                  "action": "sum",
                  "expression": {
                    "name": "added",
                    "op": "ref"
                  }
                },
                "expression": {
                  "name": "main",
                  "op": "ref"
                },
                "op": "chain"
              },
              "name": "added",
              "title": "Added"
            },
            {
              "expression": {
                "action": {
                  "action": "countDistinct",
                  "expression": {
                    "name": "unique_user",
                    "op": "ref"
                  }
                },
                "expression": {
                  "name": "main",
                  "op": "ref"
                },
                "op": "chain"
              },
              "name": "unique_user",
              "title": "Unique User"
            }
          ],
          "name": "wiki",
          "refreshRule": {
            "refresh": "PT1M",
            "rule": "fixed"
          },
          "source": "wiki",
          "subsetFilter": null,
          "timeAttribute": "time",
          "title": "Wiki"
        }
      );

    });
  });

});
