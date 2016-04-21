import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';
import * as Q from 'q';

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

  describe("validates", () => {
    it("throws an error if bad name is used", () => {
      expect(() => {
        DataSource.fromJS({
          name: 'wiki hello',
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
      }).to.throw("'wiki hello' is not a URL safe name. Try 'wiki_hello' instead?");
    });

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


  describe("#deduceAttributes", () => {
    it("works in a generic case", () => {
      var dataSource = DataSource.fromJS({
        "name": "wiki",
        "engine": "druid",
        "source": "wiki",
        "subsetFilter": null,
        introspection: 'autofill-all',
        "defaultDuration": "P1D",
        "defaultFilter": { "op": "literal", "value": true },
        "defaultPinnedDimensions": [],
        "defaultSortMeasure": "added",
        "defaultTimezone": "Etc/UTC",
        "dimensions": [
          {
            "kind": "time",
            "name": "__time",
            "expression": "$__time"
          },
          {
            "name": "page"
          },
          {
            "name": "pageInBrackets",
            "expression": "'[' ++ $page ++ ']'"
          },
          {
            "name": "userInBrackets",
            "expression": "'[' ++ $user ++ ']'"
          },
          {
            "name": "languageLookup",
            "expression": "$language.lookup(wiki_language_lookup)"
          }
        ],
        "measures": [
          {
            "name": "added",
            "expression": "$main.sum($added)"
          },
          {
            "name": "addedByDeleted",
            "expression": "$main.sum($added) / $main.sum($deleted)"
          },
          {
            "name": "unique_user",
            "expression": "$main.countDistinct($unique_user)"
          }
        ]
      });

      expect(AttributeInfo.toJSs(dataSource.deduceAttributes())).to.deep.equal([
        {
          "name": "__time",
          "type": "TIME"
        },
        {
          "name": "page",
          "type": "STRING"
        },
        {
          "name": "user",
          "type": "STRING"
        },
        {
          "name": "language",
          "type": "STRING"
        },
        {
          "name": "added",
          "type": "NUMBER"
        },
        {
          "name": "deleted",
          "type": "NUMBER"
        },
        {
          "name": "unique_user",
          "special": "unique",
          "type": "STRING"
        }
      ]);

    });

  });


  describe("#addAttributes", () => {
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

    it("works in basic case (no count) + re-add", () => {
      var attributes1 = AttributeInfo.fromJSs([
        { name: '__time', type: 'TIME' },
        { name: 'page', type: 'STRING' },
        { name: 'added', type: 'NUMBER' },
        { name: 'unique_user', special: 'unique' }
      ]);

      var dataSource1 = dataSourceStub.addAttributes(attributes1);
      expect(dataSource1.toJS()).to.deep.equal({
        "name": "wiki",
        "title": "Wiki",
        "engine": "druid",
        "source": "wiki",
        "refreshRule": {
          "refresh": "PT1M",
          "rule": "fixed"
        },
        "subsetFilter": null,
        introspection: 'autofill-all',
        "defaultDuration": "P1D",
        "defaultFilter": { "op": "literal", "value": true },
        "defaultPinnedDimensions": [],
        "defaultSortMeasure": "added",
        "defaultTimezone": "Etc/UTC",
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
      });

      var attributes2 = AttributeInfo.fromJSs([
        { name: '__time', type: 'TIME' },
        { name: 'page', type: 'STRING' },
        { name: 'added', type: 'NUMBER' },
        { name: 'deleted', type: 'NUMBER' },
        { name: 'unique_user', special: 'unique' },
        { name: 'user', type: 'STRING' }
      ]);

      var dataSource2 = dataSource1.addAttributes(attributes2);
      expect(dataSource2.toJS()).to.deep.equal({
        "name": "wiki",
        "title": "Wiki",
        "engine": "druid",
        "source": "wiki",
        "refreshRule": {
          "refresh": "PT1M",
          "rule": "fixed"
        },
        "subsetFilter": null,
        introspection: 'autofill-all',
        "defaultDuration": "P1D",
        "defaultFilter": { "op": "literal", "value": true },
        "defaultPinnedDimensions": [],
        "defaultSortMeasure": "added",
        "defaultTimezone": "Etc/UTC",
        "timeAttribute": '__time',
        "attributes": [
          { name: '__time', type: 'TIME' },
          { name: 'page', type: 'STRING' },
          { name: 'added', type: 'NUMBER' },
          { name: 'deleted', type: 'NUMBER' },
          { name: 'unique_user', special: 'unique', "type": "STRING" },
          { name: 'user', type: 'STRING' }
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
          },
          {
            "expression": {
              "name": "user",
              "op": "ref"
            },
            "kind": "string",
            "name": "user",
            "title": "User"
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
          },
          {
            "expression": {
              "action": {
                "action": "sum",
                "expression": {
                  "name": "deleted",
                  "op": "ref"
                }
              },
              "expression": {
                "name": "main",
                "op": "ref"
              },
              "op": "chain"
            },
            "name": "deleted",
            "title": "Deleted"
          }
        ]
      });
    });

    it("works with non-url-safe names", () => {
      var attributes1 = AttributeInfo.fromJSs([
        { name: '__time', type: 'TIME' },
        { name: 'page:#love$', type: 'STRING' },
        { name: 'added:#love$', type: 'NUMBER' },
        { name: 'unique_user:#love$', special: 'unique' }
      ]);

      var dataSource = dataSourceStub.addAttributes(attributes1);
      expect(dataSource.toJS()).to.deep.equal({
        "attributes": [
          {
            "name": "__time",
            "type": "TIME"
          },
          {
            "name": "page:#love$",
            "type": "STRING"
          },
          {
            "name": "added:#love$",
            "type": "NUMBER"
          },
          {
            "name": "unique_user:#love$",
            "special": "unique",
            "type": "STRING"
          }
        ],
        "defaultDuration": "P1D",
        "defaultFilter": {
          "op": "literal",
          "value": true
        },
        "defaultPinnedDimensions": [],
        "defaultSortMeasure": "added_love_",
        "defaultTimezone": "Etc/UTC",
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
              "name": "page:#love$",
              "op": "ref"
            },
            "kind": "string",
            "name": "page_love_",
            "title": "Page Love"
          }
        ],
        "engine": "druid",
        "introspection": "autofill-all",
        "measures": [
          {
            "expression": {
              "action": {
                "action": "sum",
                "expression": {
                  "name": "added:#love$",
                  "op": "ref"
                }
              },
              "expression": {
                "name": "main",
                "op": "ref"
              },
              "op": "chain"
            },
            "name": "added_love_",
            "title": "Added Love"
          },
          {
            "expression": {
              "action": {
                "action": "countDistinct",
                "expression": {
                  "name": "unique_user:#love$",
                  "op": "ref"
                }
              },
              "expression": {
                "name": "main",
                "op": "ref"
              },
              "op": "chain"
            },
            "name": "unique_user_love_",
            "title": "Unique User Love"
          }
        ],
        "name": "wiki",
        "refreshRule": {
          "refresh": "PT1M",
          "rule": "fixed"
        },
        "source": "wiki",
        "subsetFilter": null,
        "timeAttribute": "__time",
        "title": "Wiki"
      });
    });

  });


  describe("#introspection", () => {
    var dataSource = DataSource.fromJS({
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

    it('adds new dimensions', (testComplete) => {
      var columns: any = {
        "__time": {
          "type": "LONG",
          "hasMultipleValues": false,
          "size": 0,
          "cardinality": null,
          "errorMessage": null
        },
        "added": {
          "type": "LONG",
          "hasMultipleValues": false,
          "size": 0,
          "cardinality": null,
          "errorMessage": null
        },
        "count": {
          "type": "LONG",
          "hasMultipleValues": false,
          "size": 0,
          "cardinality": null,
          "errorMessage": null
        },
        "delta_hist": {
          "type": "approximateHistogram",
          "hasMultipleValues": false,
          "size": 0,
          "cardinality": null,
          "errorMessage": null
        },
        "page": {
          "type": "STRING",
          "hasMultipleValues": false,
          "size": 0,
          "cardinality": 0,
          "errorMessage": null
        },
        "page_unique": {
          "type": "hyperUnique",
          "hasMultipleValues": false,
          "size": 0,
          "cardinality": null,
          "errorMessage": null
        }
      };

      var run = 0;
      function requester({query}) {
        return Q.fcall(() => {
          if (query.queryType === 'status') return { version: '0.8.3' };
          if (query.queryType !== 'segmentMetadata') throw new Error(`what is ${query.queryType}`);
          run++;

          if (run > 1) {
            columns.channel = {
              "type": "STRING",
              "hasMultipleValues": false,
              "size": 0,
              "cardinality": 0,
              "errorMessage": null
            };
          }

          return [{ columns }];
        });
      }

      dataSource = dataSource.createExternal(requester, null, 10000);

      dataSource.introspect()
        .then(ds1 => {
          expect(ds1.toJS().dimensions).to.deep.equal([
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
          ]);
          return dataSource.introspect();
        })
        .then(ds1 => {
          expect(ds1.toJS().dimensions).to.deep.equal([
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
            },
            {
              "expression": {
                "name": "channel",
                "op": "ref"
              },
              "kind": "string",
              "name": "channel",
              "title": "Channel"
            }
          ]);
          testComplete();
        })
        .done();
    });

  });

});
