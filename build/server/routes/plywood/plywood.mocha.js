"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var plywood_1 = require("plywood");
var supertest = require("supertest");
var app_settings_fixtures_1 = require("../../../common/models/app-settings/app-settings.fixtures");
var plywood_2 = require("./plywood");
var app = express();
app.use(bodyParser.json());
app.use("/", plywood_2.plywoodRouter(function () { return Promise.resolve(app_settings_fixtures_1.AppSettingsFixtures.wikiOnlyWithExecutor()); }));
describe("plywood router", function () {
    it("must have dataCube", function (testComplete) {
        supertest(app)
            .post("/")
            .set("Content-Type", "application/json")
            .send({
            version: "0.9.4",
            expression: plywood_1.$("main").toJS()
        })
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(400)
            .expect({ error: "must have a dataCube" }, testComplete);
    });
    it("does a query (value)", function (testComplete) {
        supertest(app)
            .post("/")
            .set("Content-Type", "application/json")
            .send({
            version: "0.9.4",
            expression: plywood_1.$("main").count().toJS(),
            dataCube: "wiki"
        })
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200)
            .expect({ result: 10 }, testComplete);
    });
    it("does a query (dataset)", function (testComplete) {
        supertest(app)
            .post("/")
            .set("Content-Type", "application/json")
            .send({
            version: "0.9.4",
            expression: plywood_1.$("main")
                .split("$channel", "Channel")
                .apply("Count", plywood_1.$("main").count())
                .sort("$Count", "descending")
                .limit(2)
                .toJS(),
            dataSource: "wiki"
        })
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200)
            .expect({
            result: {
                attributes: [
                    {
                        name: "Channel",
                        type: "STRING"
                    },
                    {
                        name: "main",
                        type: "DATASET"
                    },
                    {
                        name: "Count",
                        type: "NUMBER"
                    }
                ],
                data: [
                    {
                        Channel: "en",
                        Count: 4
                    },
                    {
                        Channel: "vi",
                        Count: 4
                    }
                ],
                keys: [
                    "Channel"
                ]
            }
        }, testComplete);
    });
});
//# sourceMappingURL=plywood.mocha.js.map