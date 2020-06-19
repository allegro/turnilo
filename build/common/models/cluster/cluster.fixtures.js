"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cluster_1 = require("./cluster");
var ClusterFixtures = (function () {
    function ClusterFixtures() {
    }
    ClusterFixtures.druidWikiClusterJS = function () {
        return {
            name: "druid-wiki",
            url: "http://192.168.99.100",
            version: "0.9.1",
            timeout: 30000,
            healthCheckTimeout: 50,
            sourceListScan: "auto",
            sourceListRefreshInterval: 10000,
            sourceReintrospectInterval: 10000,
            introspectionStrategy: "segment-metadata-fallback"
        };
    };
    ClusterFixtures.druidTwitterClusterJS = function () {
        return {
            name: "druid-twitter",
            url: "http://192.168.99.101",
            version: "0.9.1",
            timeout: 30000,
            healthCheckTimeout: 200,
            sourceListScan: "auto",
            sourceListRefreshInterval: 10000,
            sourceReintrospectInterval: 10000,
            introspectionStrategy: "segment-metadata-fallback"
        };
    };
    ClusterFixtures.druidTwitterClusterJSWithGuard = function () {
        return cluster_1.Cluster.fromJS({
            name: "druid-custom",
            url: "http://192.168.99.101",
            version: "0.9.1",
            timeout: 30000,
            healthCheckTimeout: 200,
            sourceListScan: "auto",
            sourceListRefreshInterval: 10000,
            sourceReintrospectInterval: 10000,
            guardDataCubes: true,
            introspectionStrategy: "segment-metadata-fallback"
        });
    };
    return ClusterFixtures;
}());
exports.ClusterFixtures = ClusterFixtures;
//# sourceMappingURL=cluster.fixtures.js.map