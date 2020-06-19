"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
var cluster_fixtures_1 = require("../cluster/cluster.fixtures");
var dimensions_fixtures_1 = require("../dimension/dimensions.fixtures");
var measures_fixtures_1 = require("../measure/measures.fixtures");
var data_cube_1 = require("./data-cube");
var executor = plywood_1.basicExecutorFactory({
    datasets: {
        wiki: plywood_1.Dataset.fromJS([]),
        twitter: plywood_1.Dataset.fromJS([])
    }
});
var DataCubeFixtures = (function () {
    function DataCubeFixtures() {
    }
    Object.defineProperty(DataCubeFixtures, "WIKI_JS", {
        get: function () {
            return {
                name: "wiki",
                title: "Wiki",
                description: "Wiki full description something about articles and editors",
                clusterName: "druid-wiki",
                source: "wiki",
                introspection: "none",
                attributes: [
                    { name: "time", type: "TIME" },
                    { name: "articleName", type: "STRING" },
                    { name: "page", type: "STRING" },
                    { name: "userChars", type: "SET/STRING" },
                    { name: "count", type: "NUMBER", unsplitable: true, maker: { op: "count" } }
                ],
                dimensions: dimensions_fixtures_1.DimensionsFixtures.wikiJS(),
                measures: measures_fixtures_1.MeasuresFixtures.wikiJS(),
                timeAttribute: "time",
                defaultTimezone: "Etc/UTC",
                defaultDuration: "P3D",
                defaultSortMeasure: "count",
                defaultPinnedDimensions: ["articleName"],
                defaultSelectedMeasures: ["count"],
                maxSplits: 4,
                refreshRule: {
                    time: new Date("2016-04-30T12:39:51.350Z"),
                    rule: "fixed"
                }
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataCubeFixtures, "TWITTER_JS", {
        get: function () {
            return {
                name: "twitter",
                title: "Twitter",
                description: "Twitter full description should go here - tweets and followers",
                clusterName: "druid-twitter",
                source: "twitter",
                introspection: "none",
                dimensions: dimensions_fixtures_1.DimensionsFixtures.twitterJS(),
                measures: measures_fixtures_1.MeasuresFixtures.twitterJS(),
                timeAttribute: "time",
                defaultTimezone: "Etc/UTC",
                defaultDuration: "P3D",
                defaultSortMeasure: "count",
                defaultPinnedDimensions: ["tweet"],
                refreshRule: {
                    rule: "realtime"
                }
            };
        },
        enumerable: true,
        configurable: true
    });
    DataCubeFixtures.wiki = function () {
        return data_cube_1.DataCube.fromJS(DataCubeFixtures.WIKI_JS, { executor: executor });
    };
    DataCubeFixtures.twitter = function () {
        return data_cube_1.DataCube.fromJS(DataCubeFixtures.TWITTER_JS, { executor: executor });
    };
    DataCubeFixtures.customCube = function (title, description, extendedDescription) {
        if (extendedDescription === void 0) { extendedDescription = ""; }
        return data_cube_1.DataCube.fromJS({
            name: "custom",
            title: title,
            description: description,
            extendedDescription: extendedDescription,
            clusterName: "druid-custom",
            source: "custom",
            introspection: "none",
            dimensions: [],
            measures: [],
            timeAttribute: "time",
            defaultTimezone: "Etc/UTC",
            defaultDuration: "P3D",
            maxSplits: 4,
            refreshRule: {
                rule: "realtime"
            }
        }, { executor: executor });
    };
    DataCubeFixtures.customCubeWithGuard = function () {
        return data_cube_1.DataCube.fromJS({
            name: "some-name",
            title: "customDataCubeWithGuard",
            description: "",
            extendedDescription: "",
            clusterName: "druid-custom",
            source: "custom",
            introspection: "none",
            dimensions: [],
            measures: [],
            timeAttribute: "time",
            defaultTimezone: "Etc/UTC",
            defaultDuration: "P3D",
            maxSplits: 4,
            refreshRule: {
                rule: "realtime"
            }
        }, { executor: executor, cluster: cluster_fixtures_1.ClusterFixtures.druidTwitterClusterJSWithGuard() });
    };
    return DataCubeFixtures;
}());
exports.DataCubeFixtures = DataCubeFixtures;
//# sourceMappingURL=data-cube.fixtures.js.map