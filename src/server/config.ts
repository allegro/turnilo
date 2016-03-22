import * as path from 'path';
import * as Q from 'q';
import * as nopt from 'nopt';

import { DataSource, DataSourceJS, Dimension, Measure, LinkViewConfig, LinkViewConfigJS } from '../common/models/index';
import { dataSourceToYAML } from '../common/utils/yaml-helper/yaml-helper';
import { DataSourceManager, dataSourceManagerFactory, loadFileSync, properDruidRequesterFactory, dataSourceLoaderFactory, SourceListScan } from './utils/index';


export interface ServerConfig {
  iframe?: "allow" | "deny";
}

export interface PivotConfig {
  port?: number;
  verbose?: boolean;
  brokerHost?: string;
  druidHost?: string;
  timeout?: number;
  introspectionStrategy?: string;

  pageMustLoadTimeout?: number;
  sourceListScan?: SourceListScan;
  sourceListRefreshOnLoad?: boolean;
  sourceListRefreshInterval?: number;
  sourceReintrospectOnLoad?: boolean;
  sourceReintrospectInterval?: number;

  auth?: string;
  dataSources?: DataSourceJS[];
  linkViewConfig?: LinkViewConfigJS;
  serverConfig?: ServerConfig;

  hideGitHubIcon?: boolean;
  headerBackground?: string;
}

function errorExit(message: string): void {
  console.error(message);
  process.exit(1);
}


var packageObj: any = null;
try {
  packageObj = loadFileSync(path.join(__dirname, '../../package.json'), 'json');
} catch (e) {
  errorExit(`Could not read package.json: ${e.message}`);
}
export const VERSION = packageObj.version;

function printUsage() {
  console.log(`
Usage: pivot [options]

Possible usage:

  pivot --example wiki
  pivot --druid your.broker.host:8082

      --help                   Print this help message
      --version                Display the version number
  -v, --verbose                Display the DB queries that are being made
  -p, --port                   The port pivot will run on
      --example                Start pivot with some example data (overrides all other options)
  -c, --config                 The configuration YAML files to use

      --print-config           Prints out the auto generated config
      --with-comments          Adds comments when printing the auto generated config
      --data-sources-only      Only print the data sources in the auto generated config

  -f, --file                   Start pivot on top of this file based data source (must be JSON, CSV, or TSV)

  -d, --druid                  The Druid broker node to connect to
      --introspection-strategy Druid introspection strategy
          Possible values:
          * segment-metadata-fallback - (default) use the segmentMetadata and fallback to GET route
          * segment-metadata-only     - only use the segmentMetadata query
          * datasource-get            - only use GET /druid/v2/datasources/DATASOURCE route
`
  );
}

function parseArgs() {
  return nopt(
    {
      "help": Boolean,
      "version": Boolean,
      "verbose": Boolean,
      "port": Number,
      "example": String,
      "config": String,

      "print-config": Boolean,
      "with-comments": Boolean,
      "data-sources-only": Boolean,

      "file": String,

      "druid": String,
      "introspection-strategy": String
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
  printUsage();
  process.exit();
}

if (parsedArgs['version']) {
  console.log(VERSION);
  process.exit();
}

const DEFAULT_CONFIG: PivotConfig = {
  port: 9090,
  sourceListScan: 'auto',
  sourceListRefreshInterval: 10000,
  dataSources: []
};

if (!parsedArgs['example'] && !parsedArgs['config'] && !parsedArgs['druid'] && !parsedArgs['file']) {
  printUsage();
  process.exit();
}

var exampleConfig: PivotConfig = null;
if (parsedArgs['example']) {
  delete parsedArgs['druid'];
  var example = parsedArgs['example'];
  if (example === 'wiki') {
    try {
      exampleConfig = loadFileSync(path.join(__dirname, `../../config-example-${example}.yaml`), 'yaml');
    } catch (e) {
      errorExit(`Could not load example config for '${example}': ${e.message}`);
    }
  } else {
    console.log(`Unknown example '${example}'. Possible examples are: wiki`);
    process.exit();
  }
}

var configFilePath = parsedArgs['config'];
var configFileDir: string = null;
var config: PivotConfig;
if (configFilePath) {
  configFileDir = path.dirname(configFilePath);
  try {
    config = loadFileSync(configFilePath, 'yaml');
  } catch (e) {
    errorExit(`Could not load config from '${configFilePath}': ${e.message}`);
  }
} else {
  config = DEFAULT_CONFIG;
}

// If there is an example config take its dataSources
if (exampleConfig && Array.isArray(exampleConfig.dataSources)) {
  config.dataSources = exampleConfig.dataSources;
}

// If a file is specified add it as a dataSource
var file = parsedArgs['file'];
if (file) {
  config.dataSources.push({
    name: path.basename(file, path.extname(file)),
    engine: 'native',
    source: file
  });
}

export const PRINT_CONFIG = Boolean(parsedArgs['print-config']);
export const START_SERVER = !PRINT_CONFIG;
export const VERBOSE = Boolean(parsedArgs['verbose'] || config.verbose);

export const PORT = parseInt(parsedArgs['port'] || config.port, 10) || 9090;
export const DRUID_HOST = parsedArgs['druid'] || config.brokerHost || config.druidHost;
export const TIMEOUT = parseInt(<any>config.timeout, 10) || 30000;

export const INTROSPECTION_STRATEGY = String(parsedArgs["introspection-strategy"] || config.introspectionStrategy || 'segment-metadata-fallback');
export const PAGE_MUST_LOAD_TIMEOUT = START_SERVER ? (parseInt(<any>config.pageMustLoadTimeout, 10) || 800) : 0;
export const SOURCE_LIST_SCAN: SourceListScan = START_SERVER ? config.sourceListScan : 'disable';

export const SOURCE_LIST_REFRESH_ON_LOAD = START_SERVER ? Boolean(<any>config.sourceListRefreshOnLoad) : false;
export const SOURCE_LIST_REFRESH_INTERVAL = START_SERVER ? (parseInt(<any>config.sourceListRefreshInterval, 10) || 15000) : 0;
if (SOURCE_LIST_REFRESH_INTERVAL && SOURCE_LIST_REFRESH_INTERVAL < 1000) {
  errorExit(`can not set sourceListRefreshInterval to < 1000 (is ${SOURCE_LIST_REFRESH_INTERVAL})`);
}

export const SOURCE_REINTROSPECT_ON_LOAD = START_SERVER ? Boolean(<any>config.sourceReintrospectOnLoad) : false;
export const SOURCE_REINTROSPECT_INTERVAL = START_SERVER ? (parseInt(<any>config.sourceReintrospectInterval, 10) || 0) : 0;
if (SOURCE_REINTROSPECT_INTERVAL && SOURCE_REINTROSPECT_INTERVAL < 1000) {
  errorExit(`can not set sourceReintrospectInterval to < 1000 (is ${SOURCE_REINTROSPECT_INTERVAL})`);
}

var auth = config.auth;
var authModule: any = null;
if (auth) {
  auth = path.resolve(configFileDir, auth);
  console.log(`Using auth ${auth}`);
  var authModule = require(auth);
  if (typeof authModule.auth !== 'function') errorExit('Invalid auth module');
}
export const AUTH = authModule;

export const DATA_SOURCES: DataSource[] = (config.dataSources || []).map((dataSourceJS: DataSourceJS, i: number) => {
  if (typeof dataSourceJS !== 'object') errorExit(`DataSource ${i} is not valid`);
  var dataSourceName = dataSourceJS.name;
  if (typeof dataSourceName !== 'string') errorExit(`DataSource ${i} must have a name`);

  // Convert maxTime into refreshRule if a maxTime exists
  if (dataSourceJS.maxTime && (typeof dataSourceJS.maxTime === 'string' || (<any>dataSourceJS.maxTime).toISOString)) {
    dataSourceJS.refreshRule = { rule: 'fixed', time: <any>dataSourceJS.maxTime };
    console.warn('maxTime found in config, this is deprecated please convert it to a refreshRule like so:', dataSourceJS.refreshRule);
    delete dataSourceJS.maxTime;
  }

  try {
    return DataSource.fromJS(dataSourceJS);
  } catch (e) {
    errorExit(`Could not parse data source '${dataSourceJS.name}': ${e.message}`);
    return;
  }
});

export const LINK_VIEW_CONFIG = config.linkViewConfig || null;
export const SERVER_CONFIG = config.serverConfig || {};

var druidRequester: Requester.PlywoodRequester<any> = null;
if (DRUID_HOST) {
  druidRequester = properDruidRequesterFactory({
    druidHost: DRUID_HOST,
    timeout: TIMEOUT,
    verbose: VERBOSE,
    concurrentLimit: 5
  });
}

var configDirectory = configFileDir || path.join(__dirname, '../..');

if (!PRINT_CONFIG) {
  console.log(`Starting Pivot v${VERSION}`);
}

export const DATA_SOURCE_MANAGER: DataSourceManager = dataSourceManagerFactory({
  dataSources: DATA_SOURCES,
  druidRequester,
  dataSourceLoader: dataSourceLoaderFactory(druidRequester, configDirectory, TIMEOUT, INTROSPECTION_STRATEGY),

  pageMustLoadTimeout: PAGE_MUST_LOAD_TIMEOUT,
  sourceListScan: SOURCE_LIST_SCAN,
  sourceListRefreshOnLoad: SOURCE_LIST_REFRESH_ON_LOAD,
  sourceListRefreshInterval: SOURCE_LIST_REFRESH_INTERVAL,
  sourceReintrospectOnLoad: SOURCE_REINTROSPECT_ON_LOAD,
  sourceReintrospectInterval: SOURCE_REINTROSPECT_INTERVAL,

  log: PRINT_CONFIG ? null : (line: string) => console.log(line)
});

if (PRINT_CONFIG) {
  var withComments = Boolean(parsedArgs['with-comments']);
  var dataSourcesOnly = Boolean(parsedArgs['data-sources-only']);

  DATA_SOURCE_MANAGER.getQueryableDataSources().then((dataSources) => {
    if (!dataSources.length) throw new Error('Could not find any data sources please verify network connectivity');

    var lines = [
      `# generated by Pivot version ${VERSION}`,
      `# for a more detailed walk-through go to: https://github.com/implydata/pivot/blob/master/docs/configuration.md`,
      ''
    ];

    if (!dataSourcesOnly) {
      if (VERBOSE) {
        if (withComments) {
          lines.push("# Run Pivot in verbose mode so it prints out the queries that it issues");
        }
        lines.push(`verbose: true`, '');
      }

      if (withComments) {
        lines.push("# The port on which the Pivot server will listen on");
      }
      lines.push(`port: ${PORT}`, '');

      if (DRUID_HOST) {
        if (withComments) {
          lines.push("# A Druid broker node that can serve data (only used if you have Druid based data source)");
        }
        lines.push(`druidHost: ${DRUID_HOST}`, '');

        if (withComments) {
          lines.push("# A timeout for the Druid queries in ms (default: 30000 = 30 seconds)");
          lines.push("#timeout: 30000", '');
        }
      }

      if (INTROSPECTION_STRATEGY !== 'segment-metadata-fallback') {
        if (withComments) {
          lines.push("# The introspection strategy for the Druid external");
        }
        lines.push(`introspectionStrategy: ${INTROSPECTION_STRATEGY}`, '');
      }

      if (withComments) {
        lines.push("# Should new datasources automatically be added?");
      }
      lines.push(`sourceListScan: disable`, '');
    }

    lines.push('dataSources:');
    lines = lines.concat.apply(lines, dataSources.map(d => dataSourceToYAML(d, withComments)));

    console.log(lines.join('\n'));
  }).catch((e: Error) => {
    console.error("There was an error generating a config: " + e.message);
  });
}
