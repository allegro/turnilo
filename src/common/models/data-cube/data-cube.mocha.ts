/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { expect } from "chai";
import { $, AttributeInfo } from "plywood";
import { deduceAttributes } from "../../utils/external/datacube-to-external";
import { Cluster } from "../cluster/cluster";
import { createDimension } from "../dimension/dimension";
import { allDimensions } from "../dimension/dimensions";
import { DataCube, fromConfig } from "./data-cube";
import { addAttributes } from "./queryable-data-cube";

describe("DataCube", () => {
  const druidCluster = Cluster.fromJS({
    name: "druid"
  });

  describe("validates", () => {
    it("throws an error if bad name is used", () => {
      expect(() => {
        fromConfig({
          name: "wiki hello",
          clusterName: "druid",
          source: "wiki",
          attributes: [
            { name: "__time", type: "TIME" },
            { name: "articleName", type: "STRING" },
            { name: "count", type: "NUMBER" }
          ],
          dimensions: [
            {
              name: "articleName",
              formula: "$articleName"
            }
          ],
          measures: [
            {
              name: "count",
              formula: "$main.sum($count)"
            }
          ]
        });
      }).to.throw("'wiki hello' is not a URL safe name. Try 'wiki_hello' instead?");
    });

    it("throws an error if the defaultSortMeasure can not be found", () => {
      expect(() => {
        fromConfig({
          name: "wiki",
          clusterName: "druid",
          source: "wiki",
          defaultSortMeasure: "gaga",
          attributes: [
            { name: "__time", type: "TIME" },
            { name: "articleName", type: "STRING" },
            { name: "count", type: "NUMBER" }
          ],
          dimensions: [
            {
              name: "articleName",
              formula: "$articleName"
            }
          ],
          measures: [
            {
              name: "count",
              formula: "$main.sum($count)"
            }
          ]
        });
      }).to.throw("Can not find defaultSortMeasure 'gaga' in data cube 'wiki'");
    });

    it("throws an error if duplicate name is used across measures and dimensions", () => {
      expect(() => {
        fromConfig({
          name: "wiki",
          clusterName: "druid",
          source: "wiki",
          attributes: [
            { name: "__time", type: "TIME" },
            { name: "articleName", type: "STRING" },
            { name: "count", type: "NUMBER" }
          ],
          dimensions: [
            {
              name: "articleName",
              formula: "$articleName"
            }
          ],
          measures: [
            {
              name: "articleName",
              formula: "$main.sum($count)"
            }
          ]
        });
      }).to.throw("data cube: 'wiki', names: 'articleName' found in both dimensions and measures");
    });

    it("throws an error if duplicate name is used in measures", () => {
      expect(() => {
        fromConfig({
          name: "wiki",
          clusterName: "druid",
          source: "wiki",
          attributes: [
            { name: "__time", type: "TIME" },
            { name: "articleName", type: "STRING" },
            { name: "count", type: "NUMBER" }
          ],
          dimensions: [
            {
              name: "notArticleName",
              formula: "$notArticleName"
            }
          ],
          measures: [
            {
              name: "articleName",
              formula: "$main.sum($count)"
            },
            {
              name: "articleName",
              formula: "$articleName"
            }
          ]
        });
      }).to.throw("data cube: 'wiki', found duplicate measure with name: 'articleName'");
    });

    it("throws an error if duplicate name is used in dimensions", () => {
      expect(() => {
        fromConfig({
          name: "wiki",
          clusterName: "druid",
          source: "wiki",
          attributes: [
            { name: "__time", type: "TIME" },
            { name: "articleName", type: "STRING" },
            { name: "count", type: "NUMBER" }
          ],
          dimensions: [
            {
              name: "articleName",
              formula: "$articleName"
            },
            {
              name: "articleName",
              formula: "$articleName.substr(0,2)"
            }
          ],
          measures: [
            {
              name: "articleName",
              formula: "$main.sum($count)"
            }
          ]
        });
      }).to.throw("data cube: 'wiki', found duplicate dimension with name: 'articleName'");
    });

  });

  describe.skip("back compat", () => {
    it("works in a generic case", () => {
      const legacyDataCubeJS: any = {
        name: "wiki",
        title: "Wiki",
        clusterName: "druid",
        source: "wiki",
        subsetFilter: "$page.in(['en', 'fr'])",
        dimensions: [
          {
            kind: "time",
            name: "__time",
            formula: "$__time"
          },
          {
            name: "page"
          }
        ],
        measures: [
          {
            name: "added",
            formula: "$main.sum($added)"
          }
        ],
        options: {
          skipIntrospection: true,
          attributeOverrides: [
            {
              name: "page",
              type: "STRING"
            }
          ],
          defaultSplits: "__time",
          druidContext: {
            priority: 13
          }
        }
      };

      var dataCube = fromConfig(legacyDataCubeJS, druidCluster);

      expect(dataCube).to.deep.equal({
        attributeOverrides: [
          {
            name: "page",
            type: "STRING"
          }
        ],
        clusterName: "druid",
        defaultSortMeasure: "added",
        defaultSplits: [
          {
            expression: {
              name: "__time",
              op: "ref"
            }
          }
        ],
        description: "",
        dimensions: [
          {
            kind: "time",
            name: "__time",
            title: "Time",
            formula: "$__time"
          },
          {
            kind: "string",
            name: "page",
            title: "Page",
            formula: "$page"
          }
        ],
        introspection: "none",
        measures: [
          {
            name: "added",
            title: "Added",
            formula: "$main.sum($added)"
          }
        ],
        name: "wiki",
        options: {
          druidContext: {
            priority: 13
          }
        },
        refreshRule: {
          rule: "query"
        },
        source: "wiki",
        subsetFormula: "$page.in(['en', 'fr'])",
        timeAttribute: "__time",
        title: "Wiki"
      });

    });

  });

  describe("#deduceAttributes", () => {
    it("works in a generic case", () => {
      var dataCube = fromConfig({
        name: "wiki",
        clusterName: "druid",
        source: "wiki",
        introspection: "autofill-all",
        defaultSortMeasure: "added",
        defaultTimezone: "Etc/UTC",
        dimensions: [
          {
            kind: "time",
            name: "__time",
            formula: "$__time"
          },
          {
            name: "page"
          },
          {
            name: "pageInBrackets",
            formula: "'[' ++ $page ++ ']'"
          },
          {
            name: "userInBrackets",
            formula: "'[' ++ $user ++ ']'"
          },
          {
            name: "languageLookup",
            formula: "$language.lookup(wiki_language_lookup)"
          }
        ],
        measures: [
          {
            name: "added",
            formula: "$main.sum($added)"
          },
          {
            name: "addedByDeleted",
            formula: "$main.sum($added) / $main.sum($deleted)"
          }
        ]
      }, druidCluster);

      expect(AttributeInfo.toJSs(deduceAttributes(dataCube))).to.deep.equal([
        {
          name: "__time",
          type: "TIME"
        },
        {
          name: "page",
          type: "STRING"
        },
        {
          name: "user",
          type: "STRING"
        },
        {
          name: "language",
          type: "STRING"
        },
        {
          name: "added",
          type: "NUMBER"
        },
        {
          name: "deleted",
          type: "NUMBER"
        }
      ]);
    });

    it("omits unsupported expressions", () => {
      var dataCube = fromConfig({
        name: "wiki",
        clusterName: "druid",
        source: "wiki",
        introspection: "autofill-all",
        defaultSortMeasure: "added",
        defaultTimezone: "Etc/UTC",
        dimensions: [],
        measures: [
          {
            name: "added",
            formula: "$main.sum($added)"
          },
          {
            name: "addedByDeleted",
            formula: "$main.sum($added) / $main.sum($deleted)"
          },
          {
            name: "unsupported_unique_user",
            formula: "$main.countDistinct($unique_user)"
          },
          {
            name: "unsupported_click_percentile",
            formula: "$main.quantile($click_histogram,0.95)"
          }
        ]
      }, druidCluster);

      expect(AttributeInfo.toJSs(deduceAttributes(dataCube))).to.deep.equal([
        {
          name: "__time",
          type: "TIME"
        },
        {
          name: "added",
          type: "NUMBER"
        },
        {
          name: "deleted",
          type: "NUMBER"
        }
      ]);
    });

  });

  describe("#addAttributes", () => {
    const dataCubeStub = fromConfig({
      name: "wiki",
      title: "Wiki",
      clusterName: "druid",
      source: "wiki",
      introspection: "autofill-all",
      defaultTimezone: "Etc/UTC",
      refreshRule: {
        rule: "realtime"
      }
    });
    /* TODO: check the correctness of the test */
    /*
        it("works in basic case (no count) + re-add", () => {
          var attributes1 = AttributeInfo.fromJSs([
            { name: '__time', type: 'TIME' },
            { name: 'page', type: 'STRING' },
            { name: 'added', type: 'NUMBER' },
            { name: 'unique_user', special: 'unique' }
          ]);

          var dataCube1 = dataCubeStub.addAttributes(attributes1);
          expect(dataCube1.toJS()).to.deep.equal({
            "name": "wiki",
            "title": "Wiki",
            "description": "",
            "clusterName": "druid",
            "source": "wiki",
            "refreshRule": {
              "rule": "realtime",
              "refresh": "PT1M"
            },
            "introspection": "autofill-all",
            "defaultFilter": { "op": "literal", "value": true },
            "defaultSortMeasure": "added",
            "defaultTimezone": "Etc/UTC",
            "timeAttribute": '__time',
            "attributes": [
              {
                "name": "__time",
                "type": "TIME"
              },
              {
                "name": "page",
                "type": "STRING"
              },
              {
                "name": "added",
                "type": "NUMBER"
              },
              {
                "name": "unique_user",
                "special": "unique",
                "type": "STRING"
              }
            ],
            "dimensions": [
              {
                "kind": "time",
                "name": "__time",
                "title": "Time",
                "formula": "$__time"
              },
              {
                "kind": "string",
                "name": "page",
                "title": "Page",
                "formula": "$page"
              }
            ],
            "measures": [
              {
                "name": "added",
                "title": "Added",
                "formula": "$main.sum($added)"
              },
              {
                "name": "unique_user",
                "title": "Unique User",
                "formula": "$main.countDistinct($unique_user)"
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

          var dataCube2 = dataCube1.addAttributes(attributes2);
          expect(dataCube2.toJS()).to.deep.equal({
            "name": "wiki",
            "title": "Wiki",
            "description": "",
            "clusterName": "druid",
            "source": "wiki",
            "refreshRule": {
              "refresh": "PT1M",
              "rule": "realtime"
            },
            "introspection": "autofill-all",
            "defaultFilter": { "op": "literal", "value": true },
            "defaultSortMeasure": "added",
            "defaultTimezone": "Etc/UTC",
            "timeAttribute": '__time',
            "attributes": [
              { "name": "__time", "type": "TIME" },
              { "name": "page", "type": "STRING" },
              { "name": "added", "type": "NUMBER" },
              { "name": "unique_user", "special": "unique", "type": "STRING" },
              { "name": "deleted", "type": "NUMBER" },
              { "name": "user", "type": "STRING" }
            ],
            "dimensions": [
              {
                "kind": "time",
                "name": "__time",
                "title": "Time",
                "formula": "$__time"
              },
              {
                "kind": "string",
                "name": "page",
                "title": "Page",
                "formula": "$page"
              },
              {
                "kind": "string",
                "name": "user",
                "title": "User",
                "formula": "$user"
              }
            ],
            "measures": [
              {
                "name": "added",
                "title": "Added",
                "formula": "$main.sum($added)"
              },
              {
                "name": "unique_user",
                "title": "Unique User",
                "formula": "$main.countDistinct($unique_user)"
              },
              {
                "name": "deleted",
                "title": "Deleted",
                "formula": "$main.sum($deleted)"
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

          var dataCube = dataCubeStub.addAttributes(attributes1);
          expect(dataCube.toJS()).to.deep.equal({
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
            "clusterName": "druid",
            "defaultFilter": {
              "op": "literal",
              "value": true
            },
            "defaultSortMeasure": "added_love_",
            "defaultTimezone": "Etc/UTC",
            "dimensions": [
              {
                "kind": "time",
                "name": "__time",
                "title": "Time",
                "formula": "$__time"
              },
              {
                "kind": "string",
                "name": "page_love_",
                "title": "Page Love",
                "formula": "${page:#love$}"
              }
            ],
            "introspection": "autofill-all",
            "measures": [
              {
                "name": "added_love_",
                "title": "Added Love",
                "formula": "$main.sum(${added:#love$})"
              },
              {
                "name": "unique_user_love_",
                "title": "Unique User Love",
                "formula": "$main.countDistinct(${unique_user:#love$})"
              }
            ],
            "name": "wiki",
            "refreshRule": {
              "refresh": "PT1M",
              "rule": "fixed"
            },
            "source": "wiki",
            "timeAttribute": "__time",
            "title": "Wiki",
            "description": ""
          });
        });*/

    it("works with existing dimension", () => {
      const attributes1 = AttributeInfo.fromJSs([
        { name: "__time", type: "TIME" },
        { name: "added", type: "NUMBER" },
        { name: "added!!!", type: "NUMBER" },
        { name: "deleted", type: "NUMBER" }
      ]);

      const dataCubeWithDim = fromConfig({
        name: "wiki",
        title: "Wiki",
        clusterName: "druid",
        source: "wiki",
        subsetFormula: null,
        introspection: "autofill-all",
        defaultTimezone: "Etc/UTC",
        refreshRule: {
          rule: "realtime"
        },
        dimensions: [
          {
            name: "added",
            formula: "$added"
          },
          {
            name: "added_",
            formula: "${added!!!}"
          }
        ]
      });

      const dataCube = addAttributes(dataCubeWithDim, attributes1);
      expect(Object.keys(dataCube.measures.byName)).to.deep.equal(["deleted"]);
    });

  });

  describe("#addAttributes (new dim)", () => {
    const dataCube = fromConfig({
      name: "wiki",
      title: "Wiki",
      clusterName: "druid",
      source: "wiki",
      subsetFormula: null,
      introspection: "autofill-all",
      defaultTimezone: "Etc/UTC",
      refreshRule: {
        rule: "realtime"
      }
    });

    it("adds new dimensions", () => {
      const columns: any = [
        { name: "__time", type: "TIME" },
        { name: "added", makerAction: { action: "sum", expression: { name: "added", op: "ref" } }, type: "NUMBER", unsplitable: true },
        { name: "count", makerAction: { action: "count" }, type: "NUMBER", unsplitable: true },
        { name: "delta_hist", special: "histogram", type: "NUMBER" },
        { name: "page", type: "STRING" },
        { name: "page_unique", special: "unique", type: "STRING" }
      ];

      const dataCube1 = addAttributes(dataCube, AttributeInfo.fromJSs(columns));

      expect(allDimensions(dataCube1.dimensions)).to.deep.equal([
        createDimension("time", "__time", $("__time")),
        createDimension("string", "page", $("page"))
      ]);

      columns.push({ name: "channel", type: "STRING" });
      const dataCube2 = addAttributes(dataCube1, AttributeInfo.fromJSs(columns));

      expect(allDimensions(dataCube2.dimensions)).to.deep.equal([
        createDimension("time", "__time", $("__time")),
        createDimension("string", "page", $("page")),
        createDimension("string", "channel", $("channel"))
      ]);

    });

  });
});
