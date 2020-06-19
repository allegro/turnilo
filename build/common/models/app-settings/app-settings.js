"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_class_1 = require("immutable-class");
var general_1 = require("../../utils/general/general");
var immutable_utils_1 = require("../../utils/immutable-utils/immutable-utils");
var cluster_1 = require("../cluster/cluster");
var customization_1 = require("../customization/customization");
var data_cube_1 = require("../data-cube/data-cube");
var check;
var AppSettings = (function () {
    function AppSettings(parameters) {
        var version = parameters.version, clusters = parameters.clusters, customization = parameters.customization, dataCubes = parameters.dataCubes;
        for (var _i = 0, dataCubes_1 = dataCubes; _i < dataCubes_1.length; _i++) {
            var dataCube = dataCubes_1[_i];
            if (dataCube.clusterName === "native")
                continue;
            if (!immutable_class_1.NamedArray.findByName(clusters, dataCube.clusterName)) {
                throw new Error("data cube " + dataCube.name + " refers to an unknown cluster " + dataCube.clusterName);
            }
        }
        this.version = version || 0;
        this.clusters = clusters;
        this.customization = customization;
        this.dataCubes = dataCubes;
    }
    AppSettings.isAppSettings = function (candidate) {
        return candidate instanceof AppSettings;
    };
    AppSettings.fromJS = function (parameters, context) {
        if (!context)
            throw new Error("AppSettings must have context");
        var clusters;
        if (parameters.clusters) {
            clusters = parameters.clusters.map(function (cluster) { return cluster_1.Cluster.fromJS(cluster); });
        }
        else if (general_1.hasOwnProperty(parameters, "druidHost") || general_1.hasOwnProperty(parameters, "brokerHost")) {
            var clusterJS = JSON.parse(JSON.stringify(parameters));
            clusterJS.name = "druid";
            clusterJS.type = "druid";
            clusterJS.host = clusterJS.druidHost || clusterJS.brokerHost;
            clusters = [cluster_1.Cluster.fromJS(clusterJS)];
        }
        else {
            clusters = [];
        }
        var executorFactory = context.executorFactory;
        var dataCubes = (parameters.dataCubes || parameters.dataSources || []).map(function (dataCubeJS) {
            var dataCubeClusterName = dataCubeJS.clusterName || dataCubeJS.engine;
            if (dataCubeClusterName !== "native") {
                var cluster = immutable_class_1.NamedArray.findByName(clusters, dataCubeClusterName);
                if (!cluster)
                    throw new Error("Can not find cluster '" + dataCubeClusterName + "' for data cube '" + dataCubeJS.name + "'");
            }
            var dataCubeObject = data_cube_1.DataCube.fromJS(dataCubeJS, { cluster: cluster });
            if (executorFactory) {
                var executor = executorFactory(dataCubeObject);
                if (executor)
                    dataCubeObject = dataCubeObject.attachExecutor(executor);
            }
            return dataCubeObject;
        });
        var value = {
            version: parameters.version,
            clusters: clusters,
            customization: customization_1.Customization.fromJS(parameters.customization || {}),
            dataCubes: dataCubes
        };
        return new AppSettings(value);
    };
    AppSettings.prototype.valueOf = function () {
        return {
            version: this.version,
            clusters: this.clusters,
            customization: this.customization,
            dataCubes: this.dataCubes
        };
    };
    AppSettings.prototype.toJS = function () {
        var js = {};
        if (this.version)
            js.version = this.version;
        js.clusters = this.clusters.map(function (cluster) { return cluster.toJS(); });
        js.customization = this.customization.toJS();
        js.dataCubes = this.dataCubes.map(function (dataCube) { return dataCube.toJS(); });
        return js;
    };
    AppSettings.prototype.toJSON = function () {
        return this.toJS();
    };
    AppSettings.prototype.toString = function () {
        return "[AppSettings v" + this.version + " dataCubes=" + this.dataCubes.length + "]";
    };
    AppSettings.prototype.equals = function (other) {
        return AppSettings.isAppSettings(other) &&
            this.version === other.version &&
            immutable_class_1.immutableArraysEqual(this.clusters, other.clusters) &&
            immutable_class_1.immutableEqual(this.customization, other.customization) &&
            immutable_class_1.immutableArraysEqual(this.dataCubes, other.dataCubes);
    };
    AppSettings.prototype.toClientSettings = function () {
        var value = this.valueOf();
        value.clusters = value.clusters.map(function (c) { return c.toClientCluster(); });
        value.dataCubes = value.dataCubes
            .filter(function (ds) { return ds.isQueryable(); })
            .map(function (ds) { return ds.toClientDataCube(); });
        return new AppSettings(value);
    };
    AppSettings.prototype.getVersion = function () {
        return this.version;
    };
    AppSettings.prototype.getDataCubesForCluster = function (clusterName) {
        return this.dataCubes.filter(function (dataCube) { return dataCube.clusterName === clusterName; });
    };
    AppSettings.prototype.getDataCube = function (dataCubeName) {
        return immutable_class_1.NamedArray.findByName(this.dataCubes, dataCubeName);
    };
    AppSettings.prototype.addOrUpdateDataCube = function (dataCube) {
        var value = this.valueOf();
        value.dataCubes = immutable_class_1.NamedArray.overrideByName(value.dataCubes, dataCube);
        return new AppSettings(value);
    };
    AppSettings.prototype.deleteDataCube = function (dataCube) {
        var value = this.valueOf();
        var index = value.dataCubes.indexOf(dataCube);
        if (index === -1) {
            throw new Error("Unknown dataCube : " + dataCube.toString());
        }
        var newDataCubes = value.dataCubes.concat();
        newDataCubes.splice(index, 1);
        value.dataCubes = newDataCubes;
        return new AppSettings(value);
    };
    AppSettings.prototype.attachExecutors = function (executorFactory) {
        var value = this.valueOf();
        value.dataCubes = value.dataCubes.map(function (ds) {
            var executor = executorFactory(ds);
            if (executor)
                ds = ds.attachExecutor(executor);
            return ds;
        });
        return new AppSettings(value);
    };
    AppSettings.prototype.getSuggestedCubes = function () {
        return this.dataCubes;
    };
    AppSettings.prototype.validate = function () {
        return this.customization.validate();
    };
    AppSettings.prototype.changeCustomization = function (customization) {
        return this.change("customization", customization);
    };
    AppSettings.prototype.changeClusters = function (clusters) {
        return this.change("clusters", clusters);
    };
    AppSettings.prototype.addCluster = function (cluster) {
        return this.changeClusters(immutable_class_1.NamedArray.overrideByName(this.clusters, cluster));
    };
    AppSettings.prototype.change = function (propertyName, newValue) {
        return immutable_utils_1.ImmutableUtils.change(this, propertyName, newValue);
    };
    AppSettings.prototype.changeDataCubes = function (dataCubes) {
        return this.change("dataCubes", dataCubes);
    };
    AppSettings.prototype.addDataCube = function (dataCube) {
        return this.changeDataCubes(immutable_class_1.NamedArray.overrideByName(this.dataCubes, dataCube));
    };
    AppSettings.prototype.filterDataCubes = function (fn) {
        var value = this.valueOf();
        value.dataCubes = value.dataCubes.filter(fn);
        return new AppSettings(value);
    };
    AppSettings.BLANK = AppSettings.fromJS({}, {});
    return AppSettings;
}());
exports.AppSettings = AppSettings;
check = AppSettings;
//# sourceMappingURL=app-settings.js.map