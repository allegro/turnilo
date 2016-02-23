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
        defaultSortMeasure: 'count',
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
        defaultSortMeasure: 'count',
        defaultPinnedDimensions: ['articleName'],
        refreshRule: {
          refresh: "PT1M",
          rule: "fixed"
        }
      }
    ]);
  });

  describe("validates defaults", () => {
    it("throws an error if the defaultSortMeasure can not be found", () => {
      expect(() => {
        DataSource.fromJS({
          name: 'wiki',
          engine: 'druid',
          source: 'wiki',
          defaultSortMeasure: 'gaga',
          attributes: [
            { name: '__time', type: 'TIME' },
            { name: 'articleName', type: 'STRING' },
            { name: 'count', type: 'NUMBER' }
          ],
          dimensions: [
            {
              name: 'articleName',
              expression: '$articleName'
            }
          ],
          measures: [
            {
              name: 'count',
              expression: '$main.sum($count)'
            }
          ]
        });
      }).to.throw("can not find defaultSortMeasure 'gaga'");
    });
  });

  describe("#getIssues", () => {
    it("raises issues", () => {
      var dataSource = DataSource.fromJS({
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
            name: 'gaga',
            expression: '$gaga'
          },
          {
            name: 'bucketArticleName',
            expression: $('articleName').numberBucket(5).toJS()
          }
        ],
        measures: [
          {
            name: 'count',
            expression: '$main.sum($count)'
          },
          {
            name: 'added',
            expression: '$main.sum($added)'
          },
          {
            name: 'sumArticleName',
            expression: '$main.sum($articleName)'
          },
          {
            name: 'koalaCount',
            expression: '$koala.sum($count)'
          },
          {
            name: 'countByThree',
            expression: '$count / 3'
          }
        ]
      });

      expect(dataSource.getIssues()).to.deep.equal([
        "failed to validate dimension 'gaga': could not resolve $gaga",
        "failed to validate dimension 'bucketArticleName': numberBucket must have input of type NUMBER or NUMBER_RANGE (is STRING)",
        "failed to validate measure 'added': could not resolve $added",
        "failed to validate measure 'sumArticleName': sum must have expression of type NUMBER (is STRING)",
        "failed to validate measure 'koalaCount': measure must contain a $main reference",
        "failed to validate measure 'countByThree': measure must contain a $main reference"
      ]);
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
          "defaultDuration": "P1D",
          "defaultFilter": { "op": "literal", "value": true },
          "defaultPinnedDimensions": [],
          "defaultSortMeasure": "added",
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
