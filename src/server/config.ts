'use strict';

import * as path from 'path';
import * as Q from 'q';
import * as nopt from 'nopt';

import { DataSource, DataSourceJS } from '../common/models/index';
import { DataSourceManager, dataSourceManagerFactory, loadFileSync } from './utils/index';

var env = process.env;
var packageObj = loadFileSync(path.join(__dirname, '../../package.json'), 'json') || {};
export const VERSION = packageObj.version;

function errorExit(e: Error): void {
  console.error(e.message);
  console.error((<any>e).stack);
  process.exit(1);
}

function printUsage() {
  console.log(`
Usage: pivot [options]

Example: pivot --druid broker.host:8082

       --help              Print this help message
       --version           Display the version number
  -p,  --port              The port pivot will run on
  -c,  --config            The configuration YAML files to use
  -d,  --druid             The Druid broker node to connect to
       --use-segment-metadata Should the segment metadata be used for introspection
`
  );
}

function parseArgs() {
  return nopt(
    {
      "help": Boolean,
      "version": Boolean,
      "port": Number,
      "config": String,
      "druid": String,
      "use-segment-metadata": Boolean
    },
    {
      "p": ["--port"],
      "c": ["--config"],
      "d": ["--druid"]
    },
    process.argv
  );
}

var parsedArgs = parseArgs();
//console.log(parsedArgs);

if (parsedArgs['help']) {
  printUsage();
  process.exit();
}

if (parsedArgs['version']) {
  console.log(packageObj.version);
  process.exit();
}

var configFilePath = parsedArgs['config'] ||  path.join(__dirname, '../../config.yaml');
var config: any = loadFileSync(configFilePath, 'yaml');
if (!config) {
  config = {};
  console.log(`Could not load config from '${configFilePath}'`);
}

export const PORT = parseInt(parsedArgs['port'] || config.port || env.PIVOT_PORT, 10) || 9090;
export const DRUID_HOST = parsedArgs['druid'] || config.druidHost || env.PIVOT_DRUID_HOST;

if (!DRUID_HOST) {
  errorExit(new Error('must have a druid host defined on the CLI or in the config'));
}

export const USE_SEGMENT_METADATA = Boolean(parsedArgs["use-segment-metadata"] || config.useSegmentMetadata);
export const SOURCE_LIST_REFRESH_INTERVAL = parseInt(config.sourceListRefreshInterval, 10) || 0;

if (SOURCE_LIST_REFRESH_INTERVAL && SOURCE_LIST_REFRESH_INTERVAL < 1000) {
  errorExit(new Error('can not refresh more often than once per second'));
}

export const DATA_SOURCES: DataSource[] = (config.dataSources || []).map((dataSourceJS: DataSourceJS, i: number) => {
  if (typeof dataSourceJS !== 'object') errorExit(new Error(`DataSource ${i} is not valid`));
  var dataSourceName = dataSourceJS.name;
  if (typeof dataSourceName !== 'string') errorExit(new Error(`DataSource ${i} must have a name`));

  try {
    return DataSource.fromJS(dataSourceJS);
  } catch (e) {
    errorExit(e);
  }
});

export const DATA_SOURCE_MANAGER: DataSourceManager = dataSourceManagerFactory({
  dataSources: DATA_SOURCES,
  druidHost: DRUID_HOST,
  useSegmentMetadata: USE_SEGMENT_METADATA,
  sourceListRefreshInterval: SOURCE_LIST_REFRESH_INTERVAL,
  log: (line: string) => console.log(line)
});
