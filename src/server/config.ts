/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as path from 'path';
import * as nopt from 'nopt';
import { arraySum } from '../common/utils/general/general';
import { Cluster, DataSource, SupportedType, AppSettings } from '../common/models/index';
import { clusterToYAML, dataSourceToYAML } from '../common/utils/yaml-helper/yaml-helper';
import { ServerSettings, ServerSettingsJS } from './models/server-settings/server-settings';
import { loadFileSync, SettingsManager, SettingsLocation, Logger, CONSOLE_LOGGER, NULL_LOGGER } from './utils/index';

const AUTH_MODULE_VERSION = 1;
const PACKAGE_FILE = path.join(__dirname, '../../package.json');

function exitWithMessage(message: string): void {
  console.log(message);

  // Hack: load the package file for no reason other than to make some time for console.log to flush
  try { loadFileSync(PACKAGE_FILE, 'json'); } catch (e) { }

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
  packageObj = loadFileSync(PACKAGE_FILE, 'json');
} catch (e) {
  exitWithError(`Could not read package.json: ${e.message}`);
}
export const VERSION = packageObj.version;

const USAGE = `
Usage: pivot [options]

Possible usage:

  pivot --examples
  pivot --druid your.broker.host:8082

General arguments:

      --help                   Print this help message
      --version                Display the version number
  -v, --verbose                Display the DB queries that are being made

Server arguments:

  -p, --port <port-number>     The port pivot will run on (default: ${ServerSettings.DEFAULT_PORT})
      
Data connection options:      
  
  Exactly one data connection option must be provided. 
  
  -c, --config <path>          Use this local configuration (YAML) file
      --examples               Start Pivot with some example data for testing / demo  
  -f, --file <path>            Start Pivot on top of this file based data source (must be JSON, CSV, or TSV)
  -d, --druid <host>           The Druid broker node to connect to
      --postgres <host>        The Postgres cluster to connect to
      --mysql <host>           The MySQL cluster to connect to
      
      --user <string>          The cluster 'user' (if needed)
      --password <string>      The cluster 'password' (if needed)
      --database <string>      The cluster 'database' (if needed)

Configuration printing utilities:      
      
      --print-config           Prints out the auto generated config
      --with-comments          Adds comments when printing the auto generated config
`;

function parseArgs() {
  return nopt(
    {
      "help": Boolean,
      "version": Boolean,
      "verbose": Boolean,
      "port": Number,
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
      "database": String
    },
    {
      "v": ["--verbose"],
      "p": ["--port"],
      "c": ["--config"],
      "f": ["--file"],
      "d": ["--druid"]
    },
    process.argv
  );
}

var parsedArgs = parseArgs();
//console.log(parsedArgs);

if (parsedArgs['help']) {
  exitWithMessage(USAGE);
}

if (parsedArgs['version']) {
  exitWithMessage(VERSION);
}

if (parsedArgs['example']) {
  delete parsedArgs['example'];
  parsedArgs['examples'] = true;
}

const SETTINGS_INPUTS = ['config', 'examples', 'file', 'druid', 'postgres', 'mysql'];

var numSettingsInputs = arraySum(SETTINGS_INPUTS.map((input) => zeroOne(parsedArgs[input])));

if (numSettingsInputs === 0) {
  exitWithMessage(USAGE);
}

if (numSettingsInputs > 1) {
  console.error(`only one of --${SETTINGS_INPUTS.join(', --')} can be given on the command line`);
  if (parsedArgs['druid'] && parsedArgs['config']) {
    console.error(`Looks like you are using --config and --druid in conjunction with each other`);
    console.error(`This usage is no longer supported. If you are migrating from Pivot < 0.9.x`);
    console.error(`Please visit: (https://github.com/implydata/pivot/blob/master/docs/pivot-0.9.x-migration.md)`);
  }
  process.exit(1);
}

export const PRINT_CONFIG = Boolean(parsedArgs['print-config']);
export const START_SERVER = !PRINT_CONFIG;

export const LOGGER: Logger = START_SERVER ? CONSOLE_LOGGER : NULL_LOGGER;

if (START_SERVER) {
  LOGGER.log(`Starting Pivot v${VERSION}`);
}

var serverSettingsFilePath = parsedArgs['config'];

if (parsedArgs['examples']) {
  serverSettingsFilePath = path.join(__dirname, `../../config-examples.yaml`);
}

var anchorPath: string;
var serverSettingsJS: any;
if (serverSettingsFilePath) {
  anchorPath = path.dirname(serverSettingsFilePath);
  try {
    serverSettingsJS = loadFileSync(serverSettingsFilePath, 'yaml');
    LOGGER.log(`Using config ${serverSettingsFilePath}`);
  } catch (e) {
    exitWithError(`Could not load config from '${serverSettingsFilePath}': ${e.message}`);
  }
} else {
  anchorPath = process.cwd();
  serverSettingsJS = {};
}

if (parsedArgs['port']) {
  serverSettingsJS.port = parsedArgs['port'];
}

export const VERBOSE = Boolean(parsedArgs['verbose'] || serverSettingsJS.verbose);
export const SERVER_SETTINGS = ServerSettings.fromJS(serverSettingsJS, anchorPath);

// --- Auth -------------------------------

var auth = parsedArgs['auth'] || serverSettingsJS.auth;
var authMiddleware: any = null;
if (auth && auth !== 'none') {
  auth = path.resolve(anchorPath, auth);
  LOGGER.log(`Using auth ${auth}`);
  try {
    var authModule = require(auth);
  } catch (e) {
    exitWithError(`error loading auth module: ${e.message}`);
  }

  if (authModule.version !== AUTH_MODULE_VERSION) {
    exitWithError(`incorrect auth module version ${authModule.version} needed ${AUTH_MODULE_VERSION}`);
  }
  if (typeof authModule.auth !== 'function') exitWithError(`Invalid auth module (must export 'auth' function`);
  authMiddleware = authModule.auth({
    logger: LOGGER,
    verbose: VERBOSE,
    version: VERSION
  });
}
export const AUTH = authMiddleware;

// --- Location -------------------------------

const CLUSTER_TYPES: SupportedType[] = ['druid', 'postgres', 'mysql'];

var settingsLocation: SettingsLocation = null;
if (serverSettingsFilePath) {
  settingsLocation = {
    location: 'local',
    readOnly: false, // ToDo: this should be true
    uri: serverSettingsFilePath
  };
} else {
  var initAppSettings = AppSettings.BLANK;

  // If a file is specified add it as a dataSource
  var fileToLoad = parsedArgs['file'];
  if (fileToLoad) {
    initAppSettings = initAppSettings.addDataSource(new DataSource({
      name: path.basename(fileToLoad, path.extname(fileToLoad)),
      clusterName: 'native',
      source: fileToLoad
    }));
  }

  for (var clusterType of CLUSTER_TYPES) {
    var host = parsedArgs[clusterType];
    if (host) {
      initAppSettings = initAppSettings.addCluster(new Cluster({
        name: clusterType,
        type: clusterType,
        host: host,
        sourceListScan: 'auto',
        sourceListRefreshInterval: 15000,

        user: parsedArgs['user'],
        password: parsedArgs['password'],
        database: parsedArgs['database']
      }));
    }
  }

  settingsLocation = {
    location: 'transient',
    readOnly: false,
    initAppSettings
  };
}

export const SETTINGS_MANAGER = new SettingsManager(settingsLocation, {
  logger: LOGGER,
  verbose: VERBOSE,
  anchorPath,
  initialLoadTimeout: SERVER_SETTINGS.pageMustLoadTimeout
});

// --- Printing -------------------------------

if (PRINT_CONFIG) {
  var withComments = Boolean(parsedArgs['with-comments']);

  SETTINGS_MANAGER.getSettings({
    timeout: 10000
  }).then(appSettings => {
    var { dataSources, clusters } = appSettings;

    if (!dataSources.length) throw new Error('Could not find any data sources, please verify network connectivity');

    var lines = [
      `# generated by Pivot version ${VERSION}`,
      `# for a more detailed walk-through go to: https://github.com/implydata/pivot/blob/v${VERSION}/docs/configuration.md`,
      ''
    ];

    if (VERBOSE) {
      if (withComments) {
        lines.push("# Run Pivot in verbose mode so it prints out the queries that it issues");
      }
      lines.push(`verbose: true`, '');
    }

    if (withComments) {
      lines.push("# The port on which the Pivot server will listen on");
    }
    lines.push(`port: ${SERVER_SETTINGS.port}`, '');

    if (clusters.length) {
      lines.push('clusters:');
      lines = lines.concat.apply(lines, clusters.map(c => clusterToYAML(c, withComments)));
    }

    lines.push('dataSources:');
    lines = lines.concat.apply(lines, dataSources.map(d => dataSourceToYAML(d, withComments)));

    console.log(lines.join('\n'));
  }).catch((e: Error) => {
    exitWithError("There was an error generating a config: " + e.message);
  });
}
