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
        attributes: [
          { name: 'time', type: 'TIME' },
          { name: 'articleName', type: 'STRING' },
          { name: 'count', type: 'NUMBER', unsplitable: true, makerAction: { action: 'count' } }
        ],
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
            expression: $('main').sum('$count').toJS()
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


  describe("validates attributes", () => {
    it("thrown an error if it has a dimension without attribute", () => {
      expect(() => {
        DataSource.fromJS({
          name: 'wiki',
          engine: 'druid',
          source: 'wiki',
          attributes: [
            { name: '__time', type: 'TIME' },
            { name: 'count', type: 'NUMBER' }
          ],
          dimensions: [
            {
              name: 'articleName',
              expression: $('articleName').toJS()
            }
          ],
          measures: [
            {
              name: 'count',
              expression: $('main').sum('$count').toJS()
            }
          ]
        });
      }).to.throw("failed to validate dimension 'articleName' in data source 'wiki': could not resolve $articleName");
    });

    it("thrown an error if it has a nonsense dimension", () => {
      expect(() => {
        DataSource.fromJS({
          name: 'wiki',
          engine: 'druid',
          source: 'wiki',
          attributes: [
            { name: '__time', type: 'TIME' },
            { name: 'articleName', type: 'STRING' },
            { name: 'count', type: 'NUMBER' }
          ],
          dimensions: [
            {
              name: 'bucketArticleName',
              expression: $('articleName').numberBucket(5).toJS()
            }
          ],
          measures: [
            {
              name: 'count',
              expression: $('main').sum('$count').toJS()
            }
          ]
        });
      }).to.throw("failed to validate dimension 'bucketArticleName' in data source 'wiki': numberBucket must have input of type NUMBER or NUMBER_RANGE (is STRING)");
    });

    it("thrown an error if it has a measure without attribute", () => {
      expect(() => {
        DataSource.fromJS({
          name: 'wiki',
          engine: 'druid',
          source: 'wiki',
          attributes: [
            { name: '__time', type: 'TIME' },
            { name: 'articleName', type: 'STRING' },
            { name: 'count', type: 'NUMBER' }
          ],
          dimensions: [
            {
              name: 'articleName',
              expression: $('articleName').toJS()
            }
          ],
          measures: [
            {
              name: 'added',
              expression: $('main').sum('$added').toJS()
            }
          ]
        });
      }).to.throw("failed to validate measure 'added' in data source 'wiki': could not resolve $added");
    });

    it("thrown an error if it has a nonsense measure", () => {
      expect(() => {
        DataSource.fromJS({
          name: 'wiki',
          engine: 'druid',
          source: 'wiki',
          attributes: [
            { name: '__time', type: 'TIME' },
            { name: 'articleName', type: 'STRING' },
            { name: 'count', type: 'NUMBER' }
          ],
          dimensions: [
            {
              name: 'articleName',
              expression: $('articleName').toJS()
            }
          ],
          measures: [
            {
              name: 'sumArticleName',
              expression: $('main').sum('$articleName').toJS()
            }
          ]
        });
      }).to.throw("failed to validate measure 'sumArticleName' in data source 'wiki': sum must have expression of type NUMBER (is STRING)");
    });
  });


  describe("setAttributes", () => {
    it("works in basic case (no count)", () => {
      var dataSourceStub = DataSource.fromJS({
        name: 'wiki',
        title: 'Wiki',
        engine: 'druid',
        source: 'wiki',
        subsetFilter: null,
        introspection: 'autofill-all',
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
        AttributeInfo.fromJS({ name: '__time', type: 'TIME' }),
        AttributeInfo.fromJS({ name: 'page', type: 'STRING' }),
        AttributeInfo.fromJS({ name: 'added', type: 'NUMBER' }),
        AttributeInfo.fromJS({ name: 'unique_user', special: 'unique' })
      ];

      expect(dataSourceStub.setAttributes(attributes).toJS()).to.deep.equal(
        {
          "name": "wiki",
          "title": "Wiki",
          "engine": "druid",
          "source": "wiki",
          "refreshRule": {
            "refresh": "PT1M",
            "rule": "fixed"
          },
          "subsetFilter": null,
          "defaultDuration": "P3D",
          "defaultFilter": { "op": "literal", "value": true },
          "defaultPinnedDimensions": [],
          "defaultSortMeasure": "rows",
          "defaultTimezone": "Etc/UTC",
          "introspection": "no-autofill",
          "timeAttribute": '__time',
          "attributes": [
            { name: '__time', type: 'TIME' },
            { name: 'page', type: 'STRING' },
            { name: 'added', type: 'NUMBER' },
            { name: 'unique_user', special: 'unique', "type": "STRING" }
          ],
          "dimensions": [
            {
              "expression": {
                "name": "__time",
                "op": "ref"
              },
              "kind": "time",
              "name": "__time",
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
          ]
        }
      );

    });
  });

});
