"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nopt = require("nopt");
var path = require("path");
var logger_1 = require("../common/logger/logger");
var app_settings_1 = require("../common/models/app-settings/app-settings");
var cluster_1 = require("../common/models/cluster/cluster");
var data_cube_1 = require("../common/models/data-cube/data-cube");
var general_1 = require("../common/utils/general/general");
var yaml_helper_1 = require("../common/utils/yaml-helper/yaml-helper");
var server_settings_1 = require("./models/server-settings/server-settings");
var file_1 = require("./utils/file/file");
var settings_manager_1 = require("./utils/settings-manager/settings-manager");
var settings_store_1 = require("./utils/settings-store/settings-store");
var AUTH_MODULE_VERSION = 1;
var PACKAGE_FILE = path.join(__dirname, "../../package.json");
function exitWithMessage(message) {
    console.log(message);
    try {
        file_1.loadFileSync(PACKAGE_FILE, "json");
    }
    catch (e) {
    }
    process.exit();
}
function exitWithError(message) {
    console.error(message);
    process.exit(1);
}
function zeroOne(thing) {
    return Number(Boolean(thing));
}
var packageObj = null;
try {
    packageObj = file_1.loadFileSync(PACKAGE_FILE, "json");
}
catch (e) {
    exitWithError("Could not read package.json: " + e.message);
}
exports.VERSION = packageObj.version;
var USAGE = "\nUsage: turnilo [options]\n\nPossible usage:\n\n  turnilo --examples\n  turnilo --druid http://your.broker.host:8082\n\nGeneral arguments:\n\n      --help                   Print this help message\n      --version                Display the version number\n  -v, --verbose                Display the DB queries that are being made\n\nServer arguments:\n\n  -p, --port <port-number>     The port turnilo will run on (default: " + server_settings_1.ServerSettings.DEFAULT_PORT + ")\n      --server-host <host>     The host on which to listen on (default: all hosts)\n      --server-root <root>     A custom server root to listen on (default " + server_settings_1.ServerSettings.DEFAULT_SERVER_ROOT + ")\n\nData connection options:\n\n  Exactly one data connection option must be provided.\n\n  -c, --config <path>          Use this local configuration (YAML) file\n      --examples               Start Turnilo with some example data for testing / demo\n  -f, --file <path>            Start Turnilo on top of this file based data cube (must be JSON, CSV, or TSV)\n  -d, --druid <url>            The url address (http[s]://hostname[:port]) of the druid broker. If no port, 80 is assumed for plain http, and 443 for secure https.\n\nConfiguration printing utilities:\n\n      --print-config           Prints out the auto generated config and exits\n      --with-comments          Adds comments when printing the auto generated config\n";
function parseArgs() {
    return nopt({
        "help": Boolean,
        "version": Boolean,
        "verbose": Boolean,
        "port": Number,
        "server-host": String,
        "server-root": String,
        "examples": Boolean,
        "example": String,
        "config": String,
        "auth": String,
        "print-config": Boolean,
        "with-comments": Boolean,
        "file": String,
        "druid": String
    }, {
        v: ["--verbose"],
        p: ["--port"],
        c: ["--config"],
        f: ["--file"],
        d: ["--druid"]
    }, process.argv);
}
var parsedArgs = parseArgs();
if (parsedArgs["help"]) {
    exitWithMessage(USAGE);
}
if (parsedArgs["version"]) {
    exitWithMessage(exports.VERSION);
}
if (parsedArgs["example"]) {
    delete parsedArgs["example"];
    parsedArgs["examples"] = true;
}
var SETTINGS_INPUTS = ["config", "examples", "file", "druid", "postgres", "mysql"];
var numSettingsInputs = general_1.arraySum(SETTINGS_INPUTS.map(function (input) { return zeroOne(parsedArgs[input]); }));
if (numSettingsInputs === 0) {
    exitWithMessage(USAGE);
}
if (numSettingsInputs > 1) {
    console.error("only one of --" + SETTINGS_INPUTS.join(", --") + " can be given on the command line");
    if (parsedArgs["druid"] && parsedArgs["config"]) {
        console.error("Looks like you are using --config and --druid in conjunction with each other");
        console.error("This usage is no longer supported. If you are migrating from Swiv < 0.9.x");
        console.error("Please visit: (https://github.com/yahoo/swiv/blob/master/docs/swiv-0.9.x-migration.md)");
    }
    process.exit(1);
}
exports.PRINT_CONFIG = Boolean(parsedArgs["print-config"]);
exports.START_SERVER = !exports.PRINT_CONFIG;
var logger = exports.START_SERVER ? logger_1.LOGGER : logger_1.NULL_LOGGER;
var serverSettingsFilePath = parsedArgs["config"];
if (parsedArgs["examples"]) {
    serverSettingsFilePath = path.join(__dirname, "../../config-examples.yaml");
}
var anchorPath;
var serverSettingsJS;
if (serverSettingsFilePath) {
    anchorPath = path.dirname(serverSettingsFilePath);
    try {
        serverSettingsJS = file_1.loadFileSync(serverSettingsFilePath, "yaml");
        logger.log("Using config " + serverSettingsFilePath);
    }
    catch (e) {
        exitWithError("Could not load config from '" + serverSettingsFilePath + "': " + e.message);
    }
}
else {
    anchorPath = process.cwd();
    serverSettingsJS = {};
}
if (parsedArgs["port"]) {
    serverSettingsJS.port = parsedArgs["port"];
}
if (parsedArgs["server-host"]) {
    serverSettingsJS.serverHost = parsedArgs["server-host"];
}
if (parsedArgs["server-root"]) {
    serverSettingsJS.serverRoot = parsedArgs["server-root"];
}
if (parsedArgs["auth"]) {
    serverSettingsJS.auth = parsedArgs["auth"];
}
exports.VERBOSE = Boolean(parsedArgs["verbose"] || serverSettingsJS.verbose);
exports.SERVER_SETTINGS = server_settings_1.ServerSettings.fromJS(serverSettingsJS);
var auth = exports.SERVER_SETTINGS.auth;
var authMiddleware = null;
if (auth && auth !== "none") {
    auth = path.resolve(anchorPath, auth);
    logger.log("Using auth " + auth);
    try {
        var authModule = require(auth);
    }
    catch (e) {
        exitWithError("error loading auth module: " + e.message);
    }
    if (authModule.version !== AUTH_MODULE_VERSION) {
        exitWithError("incorrect auth module version " + authModule.version + " needed " + AUTH_MODULE_VERSION);
    }
    if (typeof authModule.auth !== "function")
        exitWithError("Invalid auth module: must export 'auth' function");
    authMiddleware = authModule.auth({
        logger: logger,
        verbose: exports.VERBOSE,
        version: exports.VERSION,
        serverSettings: exports.SERVER_SETTINGS
    });
}
exports.AUTH = authMiddleware;
if (exports.START_SERVER) {
    logger.log("Starting Turnilo v" + exports.VERSION);
}
var settingsStore = null;
if (serverSettingsFilePath) {
    var settingsLocation = exports.SERVER_SETTINGS.getSettingsLocation();
    if (settingsLocation) {
        switch (settingsLocation.getLocation()) {
            case "file":
                var settingsFilePath = path.resolve(anchorPath, settingsLocation.uri);
                settingsStore = settings_store_1.SettingsStore.fromReadOnlyFile(settingsFilePath, settingsLocation.getFormat());
                break;
            default:
                exitWithError("unknown location '" + settingsLocation.location + "'");
        }
    }
    else {
        settingsStore = settings_store_1.SettingsStore.fromReadOnlyFile(serverSettingsFilePath, "yaml");
    }
}
else {
    var initAppSettings = app_settings_1.AppSettings.BLANK;
    var fileToLoad = parsedArgs["file"];
    if (fileToLoad) {
        initAppSettings = initAppSettings.addDataCube(new data_cube_1.DataCube({
            name: path.basename(fileToLoad, path.extname(fileToLoad)),
            clusterName: "native",
            source: fileToLoad
        }));
    }
    var url = parsedArgs.druid;
    if (url) {
        initAppSettings = initAppSettings.addCluster(new cluster_1.Cluster({
            name: "druid",
            url: url,
            sourceListScan: "auto",
            sourceListRefreshInterval: cluster_1.Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL,
            sourceListRefreshOnLoad: cluster_1.Cluster.DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD,
            sourceReintrospectInterval: cluster_1.Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL,
            sourceReintrospectOnLoad: cluster_1.Cluster.DEFAULT_SOURCE_REINTROSPECT_ON_LOAD
        }));
    }
    settingsStore = settings_store_1.SettingsStore.fromTransient(initAppSettings);
}
exports.SETTINGS_MANAGER = new settings_manager_1.SettingsManager(settingsStore, {
    logger: logger,
    verbose: exports.VERBOSE,
    anchorPath: anchorPath,
    initialLoadTimeout: exports.SERVER_SETTINGS.getPageMustLoadTimeout()
});
if (exports.PRINT_CONFIG) {
    var withComments = Boolean(parsedArgs["with-comments"]);
    exports.SETTINGS_MANAGER.getSettings({
        timeout: 10000
    }).then(function (appSettings) {
        var config = yaml_helper_1.appSettingsToYAML(appSettings, withComments, {
            header: true,
            version: exports.VERSION,
            verbose: exports.VERBOSE,
            port: exports.SERVER_SETTINGS.getPort()
        });
        process.stdout.write(config, function () { return process.exit(); });
    }).catch(function (e) {
        exitWithError("There was an error generating a config: " + e.message);
    });
}
//# sourceMappingURL=config.js.map