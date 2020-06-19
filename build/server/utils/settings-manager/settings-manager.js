"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_settings_1 = require("../../../common/models/app-settings/app-settings");
var data_cube_1 = require("../../../common/models/data-cube/data-cube");
var functional_1 = require("../../../common/utils/functional/functional");
var general_1 = require("../../../common/utils/general/general");
var promise_1 = require("../../../common/utils/promise/promise");
var time_monitor_1 = require("../../../common/utils/time-monitor/time-monitor");
var cluster_manager_1 = require("../cluster-manager/cluster-manager");
var file_manager_1 = require("../file-manager/file-manager");
var SettingsManager = (function () {
    function SettingsManager(settingsStore, options) {
        var _this = this;
        this.generateDataCubeName = function (external) {
            var appSettings = _this.appSettings;
            var source = String(external.source);
            var candidateName = source;
            var i = 0;
            while (appSettings.getDataCube(candidateName)) {
                i++;
                candidateName = source + i;
            }
            return candidateName;
        };
        this.onDatasetChange = function (dataCubeName, changedDataset) {
            var logger = _this.logger;
            logger.log("Got native dataset update for " + dataCubeName);
            var dataCube = _this.appSettings.getDataCube(dataCubeName);
            if (!dataCube)
                throw new Error("Unknown dataset " + dataCubeName);
            dataCube = dataCube.updateWithDataset(changedDataset);
            if (dataCube.refreshRule.isQuery()) {
                _this.timeMonitor.addCheck(dataCube.name, function () {
                    return data_cube_1.DataCube.queryMaxTime(dataCube);
                });
            }
            _this.appSettings = _this.appSettings.addOrUpdateDataCube(dataCube);
        };
        this.onExternalChange = function (cluster, dataCubeName, changedExternal) {
            if (!changedExternal.attributes || !changedExternal.requester)
                return Promise.resolve(null);
            var logger = _this.logger;
            logger.log("Got queryable external dataset update for " + dataCubeName + " in cluster " + cluster.name);
            var dataCube = _this.appSettings.getDataCube(dataCubeName);
            if (!dataCube) {
                dataCube = data_cube_1.DataCube.fromClusterAndExternal(dataCubeName, cluster, changedExternal);
            }
            dataCube = dataCube.updateWithExternal(changedExternal);
            if (dataCube.refreshRule.isQuery()) {
                _this.timeMonitor.addCheck(dataCube.name, function () {
                    return data_cube_1.DataCube.queryMaxTime(dataCube);
                });
            }
            _this.appSettings = _this.appSettings.addOrUpdateDataCube(dataCube);
            return Promise.resolve(null);
        };
        this.onExternalRemoved = function (cluster, dataCubeName, changedExternal) {
            if (!changedExternal.attributes || !changedExternal.requester)
                return Promise.resolve(null);
            var logger = _this.logger;
            logger.log("Got external dataset removal for " + dataCubeName + " in cluster " + cluster.name);
            var dataCube = _this.appSettings.getDataCube(dataCubeName);
            if (dataCube) {
                _this.appSettings = _this.appSettings.deleteDataCube(dataCube);
                _this.timeMonitor.removeCheck(dataCube.name);
            }
            return Promise.resolve(null);
        };
        var logger = options.logger;
        this.logger = logger;
        this.verbose = Boolean(options.verbose);
        this.anchorPath = options.anchorPath;
        this.timeMonitor = new time_monitor_1.TimeMonitor(logger);
        this.settingsStore = settingsStore;
        this.fileManagers = [];
        this.clusterManagers = [];
        this.initialLoadTimeout = options.initialLoadTimeout || 30000;
        this.appSettings = app_settings_1.AppSettings.BLANK;
        this.currentWork = settingsStore.readSettings()
            .then(function (appSettings) { return _this.reviseSettings(appSettings); })
            .catch(function (e) {
            logger.error("Fatal settings load error: " + e.message);
            logger.error(e.stack);
            throw e;
        });
    }
    SettingsManager.prototype.addClusterManager = function (cluster, dataCubes) {
        var _this = this;
        var _a = this, verbose = _a.verbose, logger = _a.logger, anchorPath = _a.anchorPath;
        var initialExternals = dataCubes.map(function (dataCube) {
            return {
                name: dataCube.name,
                external: dataCube.toExternal(),
                suppressIntrospection: dataCube.getIntrospection() === "none"
            };
        });
        logger.log("Adding cluster manager for '" + cluster.name + "' with " + general_1.pluralIfNeeded(dataCubes.length, "dataCube"));
        var clusterManager = new cluster_manager_1.ClusterManager(cluster, {
            logger: logger,
            verbose: verbose,
            anchorPath: anchorPath,
            initialExternals: initialExternals,
            onExternalChange: function (name, external) { return _this.onExternalChange(cluster, name, external); },
            onExternalRemoved: function (name, external) { return _this.onExternalRemoved(cluster, name, external); },
            generateExternalName: this.generateDataCubeName
        });
        this.clusterManagers.push(clusterManager);
        return clusterManager.init();
    };
    SettingsManager.prototype.addFileManager = function (dataCube) {
        var _this = this;
        if (dataCube.clusterName !== "native")
            throw new Error("data cube '" + dataCube.name + "' must be native to have a file manager");
        if (Array.isArray(dataCube.source))
            throw new Error("native data cube can't have multiple sources: " + dataCube.source.join(", "));
        var _a = this, verbose = _a.verbose, logger = _a.logger, anchorPath = _a.anchorPath;
        var fileManager = new file_manager_1.FileManager({
            logger: logger,
            verbose: verbose,
            anchorPath: anchorPath,
            uri: dataCube.source,
            subsetExpression: dataCube.subsetExpression,
            onDatasetChange: function (dataset) { return _this.onDatasetChange(dataCube.name, dataset); }
        });
        this.fileManagers.push(fileManager);
        return fileManager.init();
    };
    SettingsManager.prototype.getTimekeeper = function () {
        return this.timeMonitor.timekeeper;
    };
    SettingsManager.prototype.getSettings = function (opts) {
        var _this = this;
        if (opts === void 0) { opts = {}; }
        var currentWork = this.currentWork;
        currentWork = currentWork.then(function () {
            return Promise.all(_this.clusterManagers.map(function (clusterManager) { return clusterManager.refresh(); }));
        });
        var timeoutPeriod = opts.timeout || this.initialLoadTimeout;
        if (timeoutPeriod !== 0) {
            currentWork = Promise.race([currentWork, promise_1.timeout(timeoutPeriod)])
                .catch(function (e) {
                _this.logger.error("Settings load timeout hit, continuing");
            });
        }
        return currentWork.then(function () { return _this.appSettings; });
    };
    SettingsManager.prototype.reviseSettings = function (newSettings) {
        var tasks = [
            this.reviseClusters(newSettings),
            this.reviseDataCubes(newSettings)
        ];
        this.appSettings = newSettings;
        return Promise.all(tasks).then(functional_1.noop);
    };
    SettingsManager.prototype.reviseClusters = function (settings) {
        var _this = this;
        var clusters = settings.clusters;
        var tasks = clusters.map(function (cluster) { return _this.addClusterManager(cluster, settings.getDataCubesForCluster(cluster.name)); });
        return Promise.all(tasks).then(functional_1.noop);
    };
    SettingsManager.prototype.reviseDataCubes = function (settings) {
        var _this = this;
        var nativeDataCubes = settings.getDataCubesForCluster("native");
        var tasks = nativeDataCubes.map(function (dc) { return _this.addFileManager(dc); });
        return Promise.all(tasks).then(functional_1.noop);
    };
    return SettingsManager;
}());
exports.SettingsManager = SettingsManager;
//# sourceMappingURL=settings-manager.js.map