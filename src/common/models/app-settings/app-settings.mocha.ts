import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { DataSourceMock } from '../data-source/data-source.mock';
import { AppSettings } from './app-settings';
import { AppSettingsMock } from './app-settings.mock';

describe('AppSettings', () => {
  it('is an immutable class', () => {
    testImmutableClass(AppSettings, [
      AppSettingsMock.wikiOnlyJS(),
      AppSettingsMock.wikiTwitterJS()
    ]);
  });


  describe("errors", () => {
    it("errors if there is no good cluster", () => {
      var js = AppSettingsMock.wikiOnlyJS();
      js.clusters = [];
      expect(() => AppSettings.fromJS(js)).to.throw("Can not find cluster 'druid' for data source 'wiki'");
    });

  });


  describe("upgrades", () => {
    it("deals with old config style", () => {
      var oldJS: any = {
        customization: {},
        druidHost: '192.168.99.100',
        timeout: 30003,
        sourceListScan: 'auto',
        sourceListRefreshInterval: 10001,
        sourceReintrospectInterval: 10002,
        sourceReintrospectOnLoad: true,
        dataSources: [
          DataSourceMock.WIKI_JS
        ]
      };

      expect(AppSettings.fromJS(oldJS).toJS().clusters).to.deep.equal([
        {
          "name": "druid",
          "type": "druid",
          "host": "192.168.99.100",
          "introspectionStrategy": "segment-metadata-fallback",
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
          DataSourceMock.WIKI_JS
        ]
      };

      expect(AppSettings.fromJS(oldJS).toJS().clusters).to.deep.equal([
        {
          "host": "192.168.99.100",
          "introspectionStrategy": "segment-metadata-fallback",
          "name": "druid",
          "sourceListRefreshInterval": 15000,
          "sourceListScan": "disable",
          "timeout": 40000,
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
        "dataSources": []
      });
    });

    it("converts to client settings", () => {
      expect(AppSettingsMock.wikiOnly().toClientSettings().toJS()).to.deep.equal({
        "clusters": [
          {
            "introspectionStrategy": "segment-metadata-fallback",
            "name": "druid",
            "sourceListRefreshInterval": 15000,
            "sourceListScan": "disable",
            "timeout": 40000,
            "type": "druid"
          }
        ],
        "customization": {
          "customLogoSvg": "ansvgstring",
          "headerBackground": "brown",
          "title": "Hello World"
        },
        "dataSources": [
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
                "makerAction": {
                  "action": "count"
                },
                "name": "count",
                "type": "NUMBER",
                "unsplitable": true
              }
            ],
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
                  "name": "articleName",
                  "op": "ref"
                },
                "kind": "string",
                "name": "articleName",
                "title": "Article Name"
              }
            ],
            "engine": "druid",
            "introspection": "none",
            "measures": [
              {
                "expression": {
                  "action": {
                    "action": "sum",
                    "expression": {
                      "name": "count",
                      "op": "ref"
                    }
                  },
                  "expression": {
                    "name": "main",
                    "op": "ref"
                  },
                  "op": "chain"
                },
                "name": "count",
                "title": "Count"
              },
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
              }
            ],
            "name": "wiki",
            "refreshRule": {
              "rule": "fixed",
              "time": new Date('2016-04-30T12:39:51.350Z')
            },
            "source": "wiki",
            "subsetFilter": null,
            "timeAttribute": "time",
            "title": "Wiki"
          }
        ]
      });
    });

  });

});
