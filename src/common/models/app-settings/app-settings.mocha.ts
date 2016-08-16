/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class-tester';

import { $, Expression } from 'plywood';
import { DataCubeMock } from '../data-cube/data-cube.mock';
import { AppSettings } from './app-settings';
import { AppSettingsMock } from './app-settings.mock';

describe('AppSettings', () => {
  var context = AppSettingsMock.getContext();

  it('is an immutable class', () => {
    testImmutableClass(AppSettings, [
      AppSettingsMock.wikiOnlyJS(),
      AppSettingsMock.wikiTwitterJS(),
      AppSettingsMock.wikiWithLinkViewJS()
    ], { context });
  });


  describe("errors", () => {
    it("errors if there is no matching cluster", () => {
      var js = AppSettingsMock.wikiOnlyJS();
      js.clusters = [];
      expect(() => AppSettings.fromJS(js, context)).to.throw("Can not find cluster 'druid' for data cube 'wiki'");
    });

  });


  describe("back compat", () => {
    it("works with dataSources", () => {
      var oldJS: any = AppSettingsMock.wikiOnlyJS();
      oldJS.dataSources = oldJS.dataCubes;
      delete oldJS.dataCubes;
      expect(AppSettings.fromJS(oldJS, context).toJS()).to.deep.equal(AppSettingsMock.wikiOnlyJS());
    });

    it("deals with old config style", () => {
      var wikiDataCubeJS = DataCubeMock.WIKI_JS;
      delete wikiDataCubeJS.clusterName;
      (wikiDataCubeJS as any).engine = 'druid';

      var oldJS: any = {
        customization: {},
        druidHost: '192.168.99.100',
        timeout: 30003,
        sourceListScan: 'auto',
        sourceListRefreshInterval: 10001,
        sourceReintrospectInterval: 10002,
        sourceReintrospectOnLoad: true,
        dataSources: [
          wikiDataCubeJS
        ]
      };

      expect(AppSettings.fromJS(oldJS, context).toJS().clusters).to.deep.equal([
        {
          "name": "druid",
          "type": "druid",
          "host": "192.168.99.100",
          "sourceListRefreshInterval": 10001,
          "sourceListScan": "auto",
          "sourceReintrospectInterval": 10002,
          "sourceReintrospectOnLoad": true,
          "timeout": 30003
        }
      ]);
    });

    it("deals with old config style no sourceListScan=disabled", () => {
      var oldJS: any = {
        druidHost: '192.168.99.100',
        sourceListScan: 'disable',
        dataSources: [
          DataCubeMock.WIKI_JS
        ]
      };

      expect(AppSettings.fromJS(oldJS, context).toJS().clusters).to.deep.equal([
        {
          "host": "192.168.99.100",
          "name": "druid",
          "sourceListScan": "disable",
          "type": "druid"
        }
      ]);
    });

  });


  describe("general", () => {
    it("blank", () => {
      expect(AppSettings.BLANK.toJS()).to.deep.equal({
        "clusters": [],
        "customization": {},
        "dataCubes": []
      });
    });

    it("converts to client settings", () => {
      const settings = AppSettingsMock.wikiOnlyWithExecutor();

      expect(settings.toClientSettings().toJS()).to.deep.equal({
        "clusters": [
          {
            "name": "druid",
            "type": "druid"
          }
        ],
        "customization": {
          "customLogoSvg": "ansvgstring",
          "headerBackground": "brown",
          "title": "Hello World"
        },
        "dataCubes": [
          {
            "attributes": [
              {
                "name": "time",
                "type": "TIME"
              },
              {
                "name": "articleName",
                "type": "STRING"
              },
              {
                "name": "page",
                "type": "STRING"
              },
              {
                "name": "userChars",
                "type": "SET/STRING"
              },
              {
                "makerAction": {
                  "action": "count"
                },
                "name": "count",
                "type": "NUMBER",
                "unsplitable": true
              }
            ],
            "clusterName": "druid",
            "defaultDuration": "P3D",
            "defaultFilter": {
              "op": "literal",
              "value": true
            },
            "defaultPinnedDimensions": [
              "articleName"
            ],
            "defaultSelectedMeasures": [
              "count"
            ],
            "defaultSortMeasure": "count",
            "defaultTimezone": "Etc/UTC",
            "description": "Wiki description",
            "dimensions": [
              {
                "formula": "$time",
                "kind": "time",
                "name": "time",
                "title": "Time"
              },
              {
                "formula": "$articleName",
                "kind": "string",
                "name": "articleName",
                "title": "Article Name"
              },
              {
                "formula": "$page",
                "kind": "string",
                "name": "page",
                "title": "Page"
              },
              {
                "formula": "$userChars",
                "kind": 'string',
                "name": "userChars",
                "title": "User Chars"
              }
            ],
            "measures": [
              {
                "formula": "$main.sum($count)",
                "name": "count",
                "title": "Count"
              },
              {
                "formula": "$main.sum($added)",
                "name": "added",
                "title": "Added"
              }
            ],
            "name": "wiki",
            "refreshRule": {
              "rule": "fixed",
              "time": new Date('2016-04-30T12:39:51.350Z')
            },
            "source": "wiki",
            "timeAttribute": "time",
            "title": "Wiki"
          }
        ]
      });
    });

  });

});
