"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_class_1 = require("immutable-class");
var plywood_1 = require("plywood");
var url_1 = require("url");
var general_1 = require("../../utils/general/general");
function ensureNotNative(name) {
    if (name === "native") {
        throw new Error("can not be 'native'");
    }
}
function ensureNotTiny(v) {
    if (v === 0)
        return;
    if (v < 1000) {
        throw new Error("can not be < 1000 (is " + v + ")");
    }
}
function validateUrl(url) {
    try {
        new url_1.URL(url);
    }
    catch (e) {
        throw new Error("Cluster url: " + url + " has invalid format. It should be http[s]://hostname[:port]");
    }
}
function oldHostParameter(cluster) {
    return cluster.host || cluster.druidHost || cluster.brokerHost;
}
var Cluster = (function (_super) {
    __extends(Cluster, _super);
    function Cluster() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "druid";
        return _this;
    }
    Cluster.fromJS = function (parameters) {
        if (typeof parameters.timeout === "string") {
            parameters.timeout = parseInt(parameters.timeout, 10);
        }
        if (typeof parameters.sourceListRefreshInterval === "string") {
            parameters.sourceListRefreshInterval = parseInt(parameters.sourceListRefreshInterval, 10);
        }
        if (typeof parameters.sourceReintrospectInterval === "string") {
            parameters.sourceReintrospectInterval = parseInt(parameters.sourceReintrospectInterval, 10);
        }
        return new Cluster(immutable_class_1.BaseImmutable.jsToValue(Cluster.PROPERTIES, parameters, Cluster.BACKWARD_COMPATIBILITY));
    };
    Cluster.prototype.toClientCluster = function () {
        return new Cluster({
            name: this.name,
            timeout: this.timeout
        });
    };
    Cluster.prototype.makeExternalFromSourceName = function (source, version) {
        return plywood_1.External.fromValue({
            engine: "druid",
            source: source,
            version: version,
            suppress: true,
            allowSelectQueries: true,
            allowEternity: false
        });
    };
    Cluster.prototype.shouldScanSources = function () {
        return this.getSourceListScan() === "auto";
    };
    Cluster.DEFAULT_TIMEOUT = 40000;
    Cluster.DEFAULT_HEALTH_CHECK_TIMEOUT = 1000;
    Cluster.DEFAULT_SOURCE_LIST_SCAN = "auto";
    Cluster.SOURCE_LIST_SCAN_VALUES = ["disable", "auto"];
    Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL = 0;
    Cluster.DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD = true;
    Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL = 0;
    Cluster.DEFAULT_SOURCE_REINTROSPECT_ON_LOAD = true;
    Cluster.DEFAULT_INTROSPECTION_STRATEGY = "segment-metadata-fallback";
    Cluster.DEFAULT_GUARD_DATA_CUBES = false;
    Cluster.PROPERTIES = [
        { name: "name", validate: [general_1.verifyUrlSafeName, ensureNotNative] },
        { name: "url", defaultValue: null, validate: [validateUrl] },
        { name: "title", defaultValue: "" },
        { name: "version", defaultValue: null },
        { name: "timeout", defaultValue: Cluster.DEFAULT_TIMEOUT },
        { name: "healthCheckTimeout", defaultValue: Cluster.DEFAULT_HEALTH_CHECK_TIMEOUT },
        { name: "sourceListScan", defaultValue: Cluster.DEFAULT_SOURCE_LIST_SCAN, possibleValues: Cluster.SOURCE_LIST_SCAN_VALUES },
        { name: "sourceListRefreshOnLoad", defaultValue: Cluster.DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD },
        {
            name: "sourceListRefreshInterval",
            defaultValue: Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL,
            validate: [immutable_class_1.BaseImmutable.ensure.number, ensureNotTiny]
        },
        { name: "sourceReintrospectOnLoad", defaultValue: Cluster.DEFAULT_SOURCE_REINTROSPECT_ON_LOAD },
        {
            name: "sourceReintrospectInterval",
            defaultValue: Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL,
            validate: [immutable_class_1.BaseImmutable.ensure.number, ensureNotTiny]
        },
        { name: "introspectionStrategy", defaultValue: Cluster.DEFAULT_INTROSPECTION_STRATEGY },
        { name: "requestDecorator", defaultValue: null },
        { name: "decoratorOptions", defaultValue: null },
        { name: "guardDataCubes", defaultValue: Cluster.DEFAULT_GUARD_DATA_CUBES }
    ];
    Cluster.HTTP_PROTOCOL_TEST = /^http(s?):/;
    Cluster.BACKWARD_COMPATIBILITY = [{
            condition: function (cluster) { return !general_1.isTruthy(cluster.url) && general_1.isTruthy(oldHostParameter(cluster)); },
            action: function (cluster) {
                var oldHost = oldHostParameter(cluster);
                cluster.url = Cluster.HTTP_PROTOCOL_TEST.test(oldHost) ? oldHost : "http://" + oldHost;
            }
        }];
    return Cluster;
}(immutable_class_1.BaseImmutable));
exports.Cluster = Cluster;
immutable_class_1.BaseImmutable.finalize(Cluster);
//# sourceMappingURL=cluster.js.map