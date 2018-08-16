/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as nopt from "nopt";
import * as path from "path";
import { LOGGER, NULL_LOGGER } from "../common/logger/logger";
import { AppSettings, Cluster, DataCube, SupportedType } from "../common/models/index";
import { arraySum } from "../common/utils/general/general";
import { appSettingsToYAML } from "../common/utils/yaml-helper/yaml-helper";
import { ServerSettings } from "./models/index";
import { loadFileSync, SettingsManager, SettingsStore } from "./utils/index";

const AUTH_MODULE_VERSION = 1;
const PACKAGE_FILE = path.join(__dirname, "../../package.json");

function exitWithMessage(message: string): void {
  console.log(message);

  // Hack: load the package file for no reason other than to make some time for console.log to flush
  try {
    loadFileSync(PACKAGE_FILE, "json");
  } catch (e) {
  }

  process.exit();
}

function exitWithError(message: string): void {
  console.error(message);
  process.exit(1);
}

function zeroOne(thing: any): number {
  return Number(Boolean(thing));
}

var packageObj: any = null;
try {
  packageObj = loadFileSync(PACKAGE_FILE, "json");
} catch (e) {
  exitWithError(`Could not read package.json: ${e.message}`);
}
export const VERSION = packageObj.version;

const USAGE = `
Usage: turnilo [options]

Possible usage:

  turnilo --examples
  turnilo --druid your.broker.host:8082

General arguments:

      --help                   Print this help message
      --version                Display the version number
  -v, --verbose                Display the DB queries that are being made

Server arguments:

  -p, --port <port-number>     The port turnilo will run on (default: ${ServerSettings.DEFAULT_PORT})
      --server-host <host>     The host on which to listen on (default: all hosts)
      --server-root <root>     A custom server root to listen on (default ${ServerSettings.DEFAULT_SERVER_ROOT})

Data connection options:

  Exactly one data connection option must be provided.

  -c, --config <path>          Use this local configuration (YAML) file
      --examples               Start Turnilo with some example data for testing / demo
  -f, --file <path>            Start Turnilo on top of this file based data cube (must be JSON, CSV, or TSV)
  -d, --druid <host>           The Druid broker node to connect to
      --protocol	       Connection protocol to be used. Set this to 'tls' if connecting to a https broker endpoint
      --postgres <host>        The Postgres cluster to connect to
      --mysql <host>           The MySQL cluster to connect to

      --user <string>          The cluster 'user' (if needed)
      --password <string>      The cluster 'password' (if needed)
      --database <string>      The cluster 'database' (if needed)

Configuration printing utilities:

      --print-config           Prints out the auto generated config and exits
      --with-comments          Adds comments when printing the auto generated config
`;

function parseArgs() {
  return nopt(
    {
      "help": Boolean,
      "version": Boolean,
      "verbose": Boolean,

      "port": Number,
      "server-host": String,
      "server-root": String,

      "examples": Boolean,
      "example": String, // deprecated
      "config": String,
      "auth": String,

      "print-config": Boolean,
      "with-comments": Boolean,

      "file": String,
      "druid": String,
      "postgres": String,
      "mysql": String,

      "user": String,
      "password": String,
      "database": String,
      "protocol": String
    },
    {
      v: ["--verbose"],
      p: ["--port"],
      c: ["--config"],
      f: ["--file"],
      d: ["--druid"]
    },
    process.argv
  );
}

var parsedArgs = parseArgs();

if (parsedArgs["help"]) {
  exitWithMessage(USAGE);
}

if (parsedArgs["version"]) {
  exitWithMessage(VERSION);
}

if (parsedArgs["example"]) {
  delete parsedArgs["example"];
  parsedArgs["examples"] = true;
}

const SETTINGS_INPUTS = ["config", "examples", "file", "druid", "postgres", "mysql"];

var numSettingsInputs = arraySum(SETTINGS_INPUTS.map(input => zeroOne(parsedArgs[input])));

if (numSettingsInputs === 0) {
  exitWithMessage(USAGE);
}

if (numSettingsInputs > 1) {
  console.error(`only one of --${SETTINGS_INPUTS.join(", --")} can be given on the command line`);
  if (parsedArgs["druid"] && parsedArgs["config"]) {
    console.error("Looks like you are using --config and --druid in conjunction with each other");
    console.error("This usage is no longer supported. If you are migrating from Swiv < 0.9.x");
    console.error("Please visit: (https://github.com/yahoo/swiv/blob/master/docs/swiv-0.9.x-migration.md)");
  }
  process.exit(1);
}

export const PRINT_CONFIG = Boolean(parsedArgs["print-config"]);
export const START_SERVER = !PRINT_CONFIG;
const logger = START_SERVER ? LOGGER : NULL_LOGGER;

// Load server settings
var serverSettingsFilePath = parsedArgs["config"];

if (parsedArgs["examples"]) {
  serverSettingsFilePath = path.join(__dirname, "../../config-examples.yaml");
}

var anchorPath: string;
var serverSettingsJS: any;
if (serverSettingsFilePath) {
  anchorPath = path.dirname(serverSettingsFilePath);
  try {
    serverSettingsJS = loadFileSync(serverSettingsFilePath, "yaml");
    logger.log(`Using config ${serverSettingsFilePath}`);
  } catch (e) {
    exitWithError(`Could not load config from '${serverSettingsFilePath}': ${e.message}`);
  }
} else {
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

export const VERBOSE = Boolean(parsedArgs["verbose"] || serverSettingsJS.verbose);
export const SERVER_SETTINGS = ServerSettings.fromJS(serverSettingsJS);

// --- Auth -------------------------------

var auth = SERVER_SETTINGS.auth;
var authMiddleware: any = null;
if (auth && auth !== "none") {
  auth = path.resolve(anchorPath, auth);
  logger.log(`Using auth ${auth}`);
  try {
    var authModule = require(auth);
  } catch (e) {
    exitWithError(`error loading auth module: ${e.message}`);
  }

  if (authModule.version !== AUTH_MODULE_VERSION) {
    exitWithError(`incorrect auth module version ${authModule.version} needed ${AUTH_MODULE_VERSION}`);
  }
  if (typeof authModule.auth !== "function") exitWithError("Invalid auth module: must export 'auth' function");
  authMiddleware = authModule.auth({
    logger,
    verbose: VERBOSE,
    version: VERSION,
    serverSettings: SERVER_SETTINGS
  });
}
export const AUTH = authMiddleware;

// --- Sign of Life -------------------------------
if (START_SERVER) {
  logger.log(`Starting Turnilo v${VERSION}`);
}

// --- Location -------------------------------

const CLUSTER_TYPES: SupportedType[] = ["druid"];

var settingsStore: SettingsStore = null;

if (serverSettingsFilePath) {
  var settingsLocation = SERVER_SETTINGS.getSettingsLocation();
  if (settingsLocation) {
    switch (settingsLocation.getLocation()) {
      case "file":
        var settingsFilePath = path.resolve(anchorPath, settingsLocation.uri);
        if (settingsLocation.getReadOnly()) {
          settingsStore = SettingsStore.fromReadOnlyFile(settingsFilePath, settingsLocation.getFormat());
        } else {
          settingsStore = SettingsStore.fromWritableFile(settingsFilePath, settingsLocation.getFormat());
        }
        break;

      case "mysql":
        throw new Error("todo"); // ToDo: make this not incomplete.
      // settingsStore = SettingsStore.fromStateStore(require('../../../swiv-mysql-state-store/index.js').stateStoreFactory());
      // break;

      case "postgres":
        throw new Error("todo");

      default:
        exitWithError(`unknown location '${settingsLocation.location}'`);
    }

  } else {
    settingsStore = SettingsStore.fromReadOnlyFile(serverSettingsFilePath, "yaml");
  }
} else {
  var initAppSettings = AppSettings.BLANK;

  // If a file is specified add it as a dataCube
  var fileToLoad = parsedArgs["file"];
  if (fileToLoad) {
    initAppSettings = initAppSettings.addDataCube(new DataCube({
      name: path.basename(fileToLoad, path.extname(fileToLoad)),
      clusterName: "native",
      source: fileToLoad
    }));
  }

  for (var clusterType of CLUSTER_TYPES) {
    var host = parsedArgs[clusterType];
    if (host) {
      initAppSettings = initAppSettings.addCluster(new Cluster({
        name: clusterType,
        type: clusterType,
        host,
        sourceListScan: "auto",
        sourceListRefreshInterval: Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL,
        sourceListRefreshOnLoad: Cluster.DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD,
        sourceReintrospectInterval: Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL,
        sourceReintrospectOnLoad: Cluster.DEFAULT_SOURCE_REINTROSPECT_ON_LOAD,

        user: parsedArgs["user"],
        password: parsedArgs["password"],
        database: parsedArgs["database"],
        protocol: parsedArgs["protocol"]
      }));
    }
  }

  settingsStore = SettingsStore.fromTransient(initAppSettings);
}

export const SETTINGS_MANAGER = new SettingsManager(settingsStore, {
  logger,
  verbose: VERBOSE,
  anchorPath,
  initialLoadTimeout: SERVER_SETTINGS.getPageMustLoadTimeout()
});

// --- Printing -------------------------------

if (PRINT_CONFIG) {
  var withComments = Boolean(parsedArgs["with-comments"]);

  SETTINGS_MANAGER.getSettings({
    timeout: 10000
  }).then(appSettings => {
    console.log(appSettingsToYAML(appSettings, withComments, {
      header: true,
      version: VERSION,
      verbose: VERBOSE,
      port: SERVER_SETTINGS.getPort()
    }));
    process.exit();
  }).catch((e: Error) => {
    exitWithError("There was an error generating a config: " + e.message);
  });
}
