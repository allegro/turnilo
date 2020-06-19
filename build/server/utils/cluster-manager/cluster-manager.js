"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var plywood_1 = require("plywood");
var functional_1 = require("../../../common/utils/functional/functional");
var requester_1 = require("../requester/requester");
var CONNECTION_RETRY_TIMEOUT = 20000;
var DRUID_REQUEST_DECORATOR_MODULE_VERSION = 1;
function emptyResolve() {
    return Promise.resolve(null);
}
function getSourceFromExternal(external) {
    return String(external.source);
}
function externalContainsSource(external, source) {
    return Array.isArray(external.source) ? external.source.indexOf(source) > -1 : String(external.source) === source;
}
var ClusterManager = (function () {
    function ClusterManager(cluster, options) {
        var _this = this;
        this.managedExternals = [];
        this.sourceListRefreshInterval = 0;
        this.sourceListRefreshTimer = null;
        this.sourceReintrospectInterval = 0;
        this.sourceReintrospectTimer = null;
        this.initialConnectionTimer = null;
        this.scanSourceList = function () {
            var _a = _this, logger = _a.logger, cluster = _a.cluster, verbose = _a.verbose;
            if (!cluster.shouldScanSources())
                return Promise.resolve(null);
            logger.log("Scanning cluster '" + cluster.name + "' for new sources");
            return plywood_1.External.getConstructorFor(cluster.type).getSourceList(_this.requester)
                .then(function (sources) {
                if (verbose)
                    logger.log("For cluster '" + cluster.name + "' got sources: [" + sources.join(", ") + "]");
                var introspectionTasks = [];
                _this.managedExternals.forEach(function (ex) {
                    if (sources.find(function (src) { return src === String(ex.external.source); }) == null) {
                        logger.log("Missing source '" + String(ex.external.source) + "' + \" for cluster '" + cluster.name + "', removing...");
                        introspectionTasks.push(_this.removeManagedExternal(ex));
                    }
                });
                sources.forEach(function (source) {
                    var existingExternalsForSource = _this.managedExternals.filter(function (managedExternal) { return externalContainsSource(managedExternal.external, source); });
                    if (existingExternalsForSource.length) {
                        if (verbose)
                            logger.log("Cluster '" + cluster.name + "' already has an external for '" + source + "' ('" + existingExternalsForSource[0].name + "')");
                        if (!_this.introspectedSources[source]) {
                            logger.log("Cluster '" + cluster.name + "' has never seen '" + source + "' and will introspect '" + existingExternalsForSource[0].name + "'");
                            existingExternalsForSource.forEach(function (existingExternalForSource) {
                                introspectionTasks.push(_this.introspectManagedExternal(existingExternalForSource));
                            });
                        }
                    }
                    else {
                        logger.log("Cluster '" + cluster.name + "' making external for '" + source + "'");
                        var external_1 = cluster.makeExternalFromSourceName(source, _this.version).attachRequester(_this.requester);
                        var newManagedExternal_1 = {
                            name: _this.generateExternalName(external_1),
                            external: external_1,
                            autoDiscovered: true
                        };
                        introspectionTasks.push(_this.addManagedExternal(newManagedExternal_1)
                            .then(function () { return _this.introspectManagedExternal(newManagedExternal_1); }));
                    }
                });
                return Promise.all(introspectionTasks);
            }, function (e) {
                logger.error("Failed to get source list from cluster '" + cluster.name + "' because: " + e.message);
            });
        };
        this.introspectSources = function () {
            var _a = _this, logger = _a.logger, cluster = _a.cluster;
            logger.log("Introspecting all sources in cluster '" + cluster.name + "'");
            return plywood_1.External.getConstructorFor(cluster.type).getSourceList(_this.requester)
                .then(function (sources) {
                var introspectionTasks = [];
                sources.forEach(function (source) {
                    var existingExternalsForSource = _this.managedExternals.filter(function (managedExternal) { return externalContainsSource(managedExternal.external, source); });
                    if (existingExternalsForSource.length) {
                        existingExternalsForSource.forEach(function (existingExternalForSource) {
                            introspectionTasks.push(_this.introspectManagedExternal(existingExternalForSource));
                        });
                    }
                });
                return Promise.all(introspectionTasks);
            }, function (e) {
                logger.error("Failed to get source list from cluster '" + cluster.name + "' because: " + e.message);
            });
        };
        if (!cluster)
            throw new Error("must have cluster");
        this.logger = options.logger;
        this.verbose = Boolean(options.verbose);
        this.anchorPath = options.anchorPath;
        this.cluster = cluster;
        this.initialConnectionEstablished = false;
        this.introspectedSources = {};
        this.version = cluster.version;
        this.managedExternals = options.initialExternals || [];
        this.onExternalChange = options.onExternalChange || emptyResolve;
        this.onExternalRemoved = options.onExternalRemoved || emptyResolve;
        this.generateExternalName = options.generateExternalName || getSourceFromExternal;
        this.updateRequestDecorator();
        this.updateRequester();
        this.managedExternals.forEach(function (managedExternal) {
            managedExternal.external = managedExternal.external.attachRequester(_this.requester);
        });
    }
    ClusterManager.prototype.init = function () {
        var _this = this;
        var _a = this, cluster = _a.cluster, logger = _a.logger;
        if (cluster.sourceListRefreshOnLoad) {
            logger.log("Cluster '" + cluster.name + "' will refresh source list on load");
        }
        if (cluster.sourceReintrospectOnLoad) {
            logger.log("Cluster '" + cluster.name + "' will reintrospect sources on load");
        }
        return this.establishInitialConnection()
            .then(function () { return _this.introspectSources(); })
            .then(function () { return _this.scanSourceList(); });
    };
    ClusterManager.prototype.destroy = function () {
        if (this.sourceListRefreshTimer) {
            clearInterval(this.sourceListRefreshTimer);
            this.sourceListRefreshTimer = null;
        }
        if (this.sourceReintrospectTimer) {
            clearInterval(this.sourceReintrospectTimer);
            this.sourceReintrospectTimer = null;
        }
        if (this.initialConnectionTimer) {
            clearTimeout(this.initialConnectionTimer);
            this.initialConnectionTimer = null;
        }
    };
    ClusterManager.prototype.addManagedExternal = function (managedExternal) {
        this.managedExternals.push(managedExternal);
        return this.onExternalChange(managedExternal.name, managedExternal.external);
    };
    ClusterManager.prototype.updateManagedExternal = function (managedExternal, newExternal) {
        if (managedExternal.external.equals(newExternal))
            return null;
        managedExternal.external = newExternal;
        return this.onExternalChange(managedExternal.name, managedExternal.external);
    };
    ClusterManager.prototype.removeManagedExternal = function (managedExternal) {
        this.managedExternals = this.managedExternals.filter(function (ext) { return ext.external !== managedExternal.external; });
        return this.onExternalRemoved(managedExternal.name, managedExternal.external);
    };
    ClusterManager.prototype.updateRequestDecorator = function () {
        var _a = this, cluster = _a.cluster, logger = _a.logger, anchorPath = _a.anchorPath;
        if (!cluster.requestDecorator)
            return;
        var requestDecoratorPath = path.resolve(anchorPath, cluster.requestDecorator);
        logger.log("Loading requestDecorator from '" + requestDecoratorPath + "'");
        try {
            this.requestDecoratorModule = require(requestDecoratorPath);
        }
        catch (e) {
            throw new Error("error loading druidRequestDecorator module from '" + requestDecoratorPath + "': " + e.message);
        }
        if (this.requestDecoratorModule.version !== DRUID_REQUEST_DECORATOR_MODULE_VERSION) {
            throw new Error("druidRequestDecorator module '" + requestDecoratorPath + "' has incorrect version");
        }
    };
    ClusterManager.prototype.updateRequester = function () {
        var _a = this, cluster = _a.cluster, logger = _a.logger, requestDecoratorModule = _a.requestDecoratorModule;
        var druidRequestDecorator = null;
        if (cluster.type === "druid" && requestDecoratorModule) {
            logger.log("Cluster '" + cluster.name + "' creating requestDecorator");
            druidRequestDecorator = requestDecoratorModule.druidRequestDecoratorFactory(logger, {
                options: cluster.decoratorOptions,
                cluster: cluster
            });
        }
        this.requester = requester_1.properRequesterFactory({
            cluster: cluster,
            verbose: this.verbose,
            concurrentLimit: 5,
            druidRequestDecorator: druidRequestDecorator
        });
    };
    ClusterManager.prototype.updateSourceListRefreshTimer = function () {
        var _this = this;
        var _a = this, logger = _a.logger, cluster = _a.cluster;
        if (this.sourceListRefreshInterval !== cluster.getSourceListRefreshInterval()) {
            this.sourceListRefreshInterval = cluster.getSourceListRefreshInterval();
            if (this.sourceListRefreshTimer) {
                logger.log("Clearing sourceListRefresh timer in cluster '" + cluster.name + "'");
                clearInterval(this.sourceListRefreshTimer);
                this.sourceListRefreshTimer = null;
            }
            if (this.sourceListRefreshInterval && cluster.shouldScanSources()) {
                logger.log("Setting up sourceListRefresh timer in cluster '" + cluster.name + "' (every " + this.sourceListRefreshInterval + "ms)");
                this.sourceListRefreshTimer = setInterval(function () {
                    _this.scanSourceList().catch(function (e) {
                        logger.error("Cluster '" + cluster.name + "' encountered and error during SourceListRefresh: " + e.message);
                    });
                }, this.sourceListRefreshInterval);
                this.sourceListRefreshTimer.unref();
            }
        }
    };
    ClusterManager.prototype.updateSourceReintrospectTimer = function () {
        var _this = this;
        var _a = this, logger = _a.logger, cluster = _a.cluster;
        if (this.sourceReintrospectInterval !== cluster.getSourceReintrospectInterval()) {
            this.sourceReintrospectInterval = cluster.getSourceReintrospectInterval();
            if (this.sourceReintrospectTimer) {
                logger.log("Clearing sourceReintrospect timer in cluster '" + cluster.name + "'");
                clearInterval(this.sourceReintrospectTimer);
                this.sourceReintrospectTimer = null;
            }
            if (this.sourceReintrospectInterval) {
                logger.log("Setting up sourceReintrospect timer in cluster '" + cluster.name + "' (every " + this.sourceReintrospectInterval + "ms)");
                this.sourceReintrospectTimer = setInterval(function () {
                    _this.introspectSources().catch(function (e) {
                        logger.error("Cluster '" + cluster.name + "' encountered and error during SourceReintrospect: " + e.message);
                    });
                }, this.sourceReintrospectInterval);
                this.sourceReintrospectTimer.unref();
            }
        }
    };
    ClusterManager.prototype.establishInitialConnection = function () {
        var _this = this;
        var _a = this, logger = _a.logger, verbose = _a.verbose, cluster = _a.cluster;
        return new Promise(function (resolve) {
            var retryNumber = -1;
            var lastTryAt;
            var attemptConnection = function () {
                retryNumber++;
                if (retryNumber === 0) {
                    if (verbose)
                        logger.log("Attempting to connect to cluster '" + cluster.name + "'");
                }
                else {
                    logger.log("Re-attempting to connect to cluster '" + cluster.name + "' (retry " + retryNumber + ")");
                }
                lastTryAt = Date.now();
                plywood_1.External.getConstructorFor(cluster.type)
                    .getVersion(_this.requester)
                    .then(function (version) {
                    _this.onConnectionEstablished();
                    _this.internalizeVersion(version).then(function () { return resolve(null); });
                }, function (e) {
                    var msSinceLastTry = Date.now() - lastTryAt;
                    var msToWait = Math.max(1, CONNECTION_RETRY_TIMEOUT - msSinceLastTry);
                    logger.error("Failed to connect to cluster '" + cluster.name + "' because: " + e.message + " (will retry in " + msToWait + "ms)");
                    _this.initialConnectionTimer = setTimeout(attemptConnection, msToWait);
                });
            };
            attemptConnection();
        });
    };
    ClusterManager.prototype.onConnectionEstablished = function () {
        var _a = this, logger = _a.logger, cluster = _a.cluster;
        logger.log("Connected to cluster '" + cluster.name + "'");
        this.initialConnectionEstablished = true;
        this.updateSourceListRefreshTimer();
        this.updateSourceReintrospectTimer();
    };
    ClusterManager.prototype.internalizeVersion = function (version) {
        var _this = this;
        if (this.version)
            return Promise.resolve(null);
        var _a = this, logger = _a.logger, cluster = _a.cluster;
        logger.log("Cluster '" + cluster.name + "' is running druid@" + version);
        this.version = version;
        var tasks = this.managedExternals.map(function (managedExternal) {
            if (managedExternal.external.version)
                return Promise.resolve(null);
            return _this.updateManagedExternal(managedExternal, managedExternal.external.changeVersion(version));
        });
        return Promise.all(tasks).then(functional_1.noop);
    };
    ClusterManager.prototype.introspectManagedExternal = function (managedExternal) {
        var _this = this;
        var _a = this, logger = _a.logger, verbose = _a.verbose, cluster = _a.cluster;
        if (managedExternal.suppressIntrospection)
            return Promise.resolve(null);
        if (verbose)
            logger.log("Cluster '" + cluster.name + "' introspecting '" + managedExternal.name + "'");
        return managedExternal.external.introspect()
            .then(function (introspectedExternal) {
            _this.introspectedSources[String(introspectedExternal.source)] = true;
            return _this.updateManagedExternal(managedExternal, introspectedExternal);
        }, function (e) {
            logger.error("Cluster '" + cluster.name + "' could not introspect '" + managedExternal.name + "' because: " + e.message);
        });
    };
    ClusterManager.prototype.refresh = function () {
        var _this = this;
        var _a = this, cluster = _a.cluster, initialConnectionEstablished = _a.initialConnectionEstablished;
        var process = Promise.resolve(null);
        if (!initialConnectionEstablished)
            return process;
        if (cluster.sourceReintrospectOnLoad) {
            process = process.then(function () { return _this.introspectSources(); });
        }
        if (cluster.sourceListRefreshOnLoad) {
            process = process.then(function () { return _this.scanSourceList(); });
        }
        return process;
    };
    return ClusterManager;
}());
exports.ClusterManager = ClusterManager;
//# sourceMappingURL=cluster-manager.js.map