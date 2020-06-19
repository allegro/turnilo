"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var mime = require("mime");
var supertest = require("supertest");
var app_settings_fixtures_1 = require("../../../common/models/app-settings/app-settings.fixtures");
var plyql_1 = require("./plyql");
var app = express();
app.use(bodyParser.json());
app.use("/", plyql_1.plyqlRouter(function () { return Promise.resolve(app_settings_fixtures_1.AppSettingsFixtures.wikiOnlyWithExecutor()); }));
var pageQuery = "SELECT SUM(added) as Added FROM `wiki` GROUP BY page ORDER BY Added DESC LIMIT 10;";
var timeQuery = "SELECT TIME_BUCKET(time, 'PT1H', 'Etc/UTC') as TimeByHour, SUM(added) as Added FROM `wiki` GROUP BY 1 ORDER BY TimeByHour ASC";
var tests = [
    {
        outputType: "json",
        query: pageQuery,
        testName: "POST json pages added"
    },
    {
        outputType: "json",
        query: timeQuery,
        testName: "POST json timeseries"
    },
    {
        outputType: "csv",
        query: pageQuery,
        testName: "POST csv pages added"
    },
    {
        outputType: "csv",
        query: timeQuery,
        testName: "POST csv timeseries"
    },
    {
        outputType: "tsv",
        query: pageQuery,
        testName: "POST tsv pages added"
    },
    {
        outputType: "tsv",
        query: timeQuery,
        testName: "POST tsv timeseries"
    }
];
function testPlyqlHelper(testName, contentType, queryStr) {
    it(testName, function (testComplete) {
        supertest(app)
            .post("/")
            .set("Content-Type", "application/json")
            .send(queryStr)
            .expect("Content-Type", contentType + "; charset=utf-8")
            .expect(200, testComplete);
    });
}
describe("plyql router", function () {
    tests.forEach(function (test) {
        testPlyqlHelper(test.testName, mime.getType(test.outputType), JSON.stringify(test, null, 2));
    });
});
//# sourceMappingURL=plyql.mocha.js.map