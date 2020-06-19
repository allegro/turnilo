"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var request = require("request-promise-native");
var logger_1 = require("../../../common/logger/logger");
var unhealthyHttpStatus = 503;
var healthyHttpStatus = 200;
var ClusterHealthStatus;
(function (ClusterHealthStatus) {
    ClusterHealthStatus["healthy"] = "healthy";
    ClusterHealthStatus["unhealthy"] = "unhealthy";
})(ClusterHealthStatus || (ClusterHealthStatus = {}));
var statusToHttpStatus = function (status) {
    switch (status) {
        case ClusterHealthStatus.healthy:
            return healthyHttpStatus;
        case ClusterHealthStatus.unhealthy:
            return unhealthyHttpStatus;
    }
};
function checkDruidCluster(cluster) {
    return __awaiter(this, void 0, void 0, function () {
        var url, loadStatusUrl, inventoryInitialized, reason_1, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = cluster.url;
                    loadStatusUrl = url + "/druid/broker/v1/loadstatus";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, request
                            .get(loadStatusUrl, { json: true, timeout: cluster.healthCheckTimeout })
                            .promise()];
                case 2:
                    inventoryInitialized = (_a.sent()).inventoryInitialized;
                    if (!inventoryInitialized) {
                        return [2, { url: url, status: ClusterHealthStatus.unhealthy, message: "inventory not initialized" }];
                    }
                    return [2, { url: url, status: ClusterHealthStatus.healthy, message: "" }];
                case 3:
                    reason_1 = _a.sent();
                    message = reason_1 instanceof Error ? reason_1.message : "unknown";
                    return [2, { url: url, status: ClusterHealthStatus.unhealthy, message: "connection error: '" + message + "'" }];
                case 4: return [2];
            }
        });
    });
}
function checkClusters(clusters) {
    var promises = clusters
        .filter(function (cluster) { return (cluster.type === "druid"); })
        .map(checkDruidCluster);
    return Promise.all(promises);
}
function aggregateHealthStatus(clusterHealths) {
    var isSomeUnhealthy = clusterHealths.some(function (cluster) { return cluster.status === ClusterHealthStatus.unhealthy; });
    return isSomeUnhealthy ? ClusterHealthStatus.unhealthy : ClusterHealthStatus.healthy;
}
function logUnhealthy(clusterHealths) {
    var unhealthyClusters = clusterHealths.filter(function (_a) {
        var status = _a.status;
        return status === ClusterHealthStatus.unhealthy;
    });
    unhealthyClusters.forEach(function (_a) {
        var message = _a.message, url = _a.url;
        logger_1.LOGGER.log("Unhealthy cluster url: " + url + ". Message: " + message);
    });
}
function readinessRouter(getSettings) {
    var _this = this;
    var router = express_1.Router();
    router.get("/", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var settings, clusterHealths, overallHealthStatus, httpState, reason_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4, getSettings()];
                case 1:
                    settings = _a.sent();
                    return [4, checkClusters(settings.clusters)];
                case 2:
                    clusterHealths = _a.sent();
                    logUnhealthy(clusterHealths);
                    overallHealthStatus = aggregateHealthStatus(clusterHealths);
                    httpState = statusToHttpStatus(overallHealthStatus);
                    res.status(httpState).send({ status: overallHealthStatus, clusters: clusterHealths });
                    return [3, 4];
                case 3:
                    reason_2 = _a.sent();
                    logger_1.LOGGER.log("Readiness check error: " + reason_2.message);
                    res.status(unhealthyHttpStatus).send({ status: ClusterHealthStatus.unhealthy, message: reason_2.message });
                    return [3, 4];
                case 4: return [2];
            }
        });
    }); });
    return router;
}
exports.readinessRouter = readinessRouter;
//# sourceMappingURL=readiness.js.map