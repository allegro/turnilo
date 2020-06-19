"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var plywood_1 = require("plywood");
var supertest = require("supertest");
var app_settings_fixtures_1 = require("../../../common/models/app-settings/app-settings.fixtures");
var url_hash_converter_fixtures_1 = require("../../../common/utils/url-hash-converter/url-hash-converter.fixtures");
var mkurl_1 = require("./mkurl");
var mkurlPath = "/mkurl";
var app = express();
app.use(bodyParser.json());
app.use(mkurlPath, mkurl_1.mkurlRouter(function () { return Promise.resolve(app_settings_fixtures_1.AppSettingsFixtures.wikiOnlyWithExecutor()); }));
describe("mkurl router", function () {
    it("gets a simple url back", function (testComplete) {
        supertest(app)
            .post(mkurlPath)
            .set("Content-Type", "application/json")
            .send({
            dataCubeName: "wiki",
            viewDefinitionVersion: "2",
            viewDefinition: {
                visualization: "totals",
                timezone: "Etc/UTC",
                filter: plywood_1.$("time").overlap(new Date("2015-09-12Z"), new Date("2015-09-13Z")),
                pinnedDimensions: [],
                singleMeasure: "count",
                selectedMeasures: [],
                splits: []
            }
        })
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200)
            .expect({
            hash: "#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0408SqGOAygKZobYDmZe2MCClGALZNkOJvhABRNAGMA9" +
                "AFUAKgGEKIAGYQEaJgCcuAbVBoAngAdxBIeMp6mGiTfU2ASnA5MjoKCT1oJACYABgBGAFYAWmCATkjQwKVg4Lxk1OCAOmT" +
                "ggC11JmwAEyCwqNj4gGYklLTkrOS8gF8AXRbKKHMkNCNm9v0IL3xjEHsNfQKZKxAZTBhsAMoNTD1BdHwTCynChzheBfBEG" +
                "CmQRoFNiWE4WHsT3pBzCGxsJkKAEQhhbCgsL6G7h6eLwYywCBBmcwCjSAA"
        }, testComplete);
    });
    it("gets a complex url back", function (testComplete) {
        supertest(app)
            .post(mkurlPath)
            .set("Content-Type", "application/json")
            .send({
            dataCubeName: "wiki",
            viewDefinitionVersion: "2",
            viewDefinition: {
                visualization: "table",
                timezone: "Etc/UTC",
                filter: plywood_1.$("time")
                    .overlap(new Date("2015-09-12Z"), new Date("2015-09-13Z"))
                    .and(plywood_1.$("channel").overlap(["en"]))
                    .and(plywood_1.$("isRobot").overlap([true]).not())
                    .and(plywood_1.$("page").contains("Jeremy"))
                    .and(plywood_1.$("userChars").match("^A$"))
                    .and(plywood_1.$("commentLength").overlap([{ start: 3, end: null, type: "NUMBER_RANGE" }]))
                    .toJS(),
                pinnedDimensions: ["channel", "namespace", "isRobot"],
                pinnedSort: "delta",
                singleMeasure: "delta",
                selectedMeasures: ["delta", "count", "added"],
                multiMeasureMode: true,
                splits: [
                    {
                        expression: {
                            op: "ref",
                            name: "channel"
                        },
                        sortAction: {
                            op: "sort",
                            expression: {
                                op: "ref",
                                name: "delta"
                            },
                            direction: "descending"
                        },
                        limitAction: {
                            op: "limit",
                            value: 50
                        }
                    },
                    {
                        expression: {
                            op: "ref",
                            name: "isRobot"
                        },
                        sortAction: {
                            op: "sort",
                            expression: {
                                op: "ref",
                                name: "delta"
                            },
                            direction: "descending"
                        },
                        limitAction: {
                            op: "limit",
                            value: 5
                        }
                    },
                    {
                        expression: {
                            op: "ref",
                            name: "commentLength"
                        },
                        bucketAction: {
                            op: "numberBucket",
                            size: 10,
                            offset: 0
                        },
                        sortAction: {
                            op: "sort",
                            expression: {
                                op: "ref",
                                name: "delta"
                            },
                            direction: "descending"
                        },
                        limitAction: {
                            op: "limit",
                            value: 5
                        }
                    },
                    {
                        expression: {
                            op: "ref",
                            name: "time"
                        },
                        bucketAction: {
                            op: "timeBucket",
                            duration: "PT1H"
                        },
                        sortAction: {
                            op: "sort",
                            expression: {
                                op: "ref",
                                name: "delta"
                            },
                            direction: "descending"
                        }
                    }
                ]
            }
        })
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200)
            .expect({
            hash: "#wiki/" + url_hash_converter_fixtures_1.UrlHashConverterFixtures.tableHashVersion4()
        }, testComplete);
    });
});
//# sourceMappingURL=mkurl.mocha.js.map