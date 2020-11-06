/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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
import { AppSettings } from "../common/models/app-settings/app-settings";
import { Cluster } from "../common/models/cluster/cluster";
import { DataCube } from "../common/models/data-cube/data-cube";
import { arraySum } from "../common/utils/general/general";
import { appSettingsToYAML } from "../common/utils/yaml-helper/yaml-helper";
import { ServerSettings, ServerSettingsJS } from "./models/server-settings/server-settings";
import { loadFileSync } from "./utils/file/file";
import { SettingsManager } from "./utils/settings-manager/settings-manager";
import { SettingsStore } from "./utils/settings-store/settings-store";

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
  turnilo --druid http://your.broker.host:8082

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
  -d, --druid <url>            The url address (http[s]://hostname[:port]) of the druid broker. If no port, 80 is assumed for plain http, and 443 for secure https.

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
      "druid": String
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
let configPath = parsedArgs["config"];

if (parsedArgs["examples"]) {
  configPath = path.join(__dirname, "../../config-examples.yaml");
}

let serverSettingsJS: ServerSettingsJS;
let configDirPath;
let configContent;
if (configPath) {
  configDirPath = path.dirname(configPath);
  try {
    configContent = loadFileSync(configPath, "yaml");
    serverSettingsJS = configContent;
    logger.log(`Using config ${configPath}`);
  } catch (e) {
    exitWithError(`Could not load config from '${configPath}': ${e.message}`);
  }
} else {
  configDirPath = process.cwd();
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
if (parsedArgs["verbose"]) {
  serverSettingsJS.verbose = parsedArgs["verbose"];
}

// TODO: Remove this export
export const VERBOSE = Boolean(serverSettingsJS.verbose);
export const SERVER_SETTINGS = ServerSettings.fromJS(serverSettingsJS);

// --- Sign of Life -------------------------------
if (START_SERVER) {
  logger.log(`Starting Turnilo v${VERSION}`);
}

// --- Location -------------------------------

let settingsStore: SettingsStore;

if (configContent) {
  const appSettings = AppSettings.fromJS(configContent, {});
  // TODO: this validation should be done via #365
  appSettings.validate();
  settingsStore = SettingsStore.create(appSettings);
} else {
  let initAppSettings = AppSettings.BLANK;

  // If a file is specified add it as a dataCube
  const fileToLoad = parsedArgs["file"];
  if (fileToLoad) {
    initAppSettings = initAppSettings.addDataCube(new DataCube({
      name: path.basename(fileToLoad, path.extname(fileToLoad)),
      clusterName: "native",
      source: fileToLoad
    }));
  }

  const url = parsedArgs.druid;
  if (url) {
    initAppSettings = initAppSettings.addCluster(new Cluster({
      name: "druid",
      url,
      sourceListScan: "auto",
      sourceListRefreshInterval: Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL,
      sourceListRefreshOnLoad: Cluster.DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD,
      sourceReintrospectInterval: Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL,
      sourceReintrospectOnLoad: Cluster.DEFAULT_SOURCE_REINTROSPECT_ON_LOAD
    }));
  }

  settingsStore = SettingsStore.create(initAppSettings);
}

export const SETTINGS_MANAGER = new SettingsManager(settingsStore, {
  logger,
  verbose: VERBOSE,
  anchorPath: configDirPath,
  initialLoadTimeout: SERVER_SETTINGS.getPageMustLoadTimeout()
});

// --- Printing -------------------------------

if (PRINT_CONFIG) {
  var withComments = Boolean(parsedArgs["with-comments"]);

  SETTINGS_MANAGER.getFreshSettings({
    timeout: 10000
  }).then(appSettings => {
    const config = appSettingsToYAML(appSettings, withComments, {
      header: true,
      version: VERSION,
      verbose: VERBOSE,
      port: SERVER_SETTINGS.getPort()
    });
    process.stdout.write(config, () => process.exit());
  }).catch((e: Error) => {
    exitWithError("There was an error generating a config: " + e.message);
  });
}
