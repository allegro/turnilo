'use strict';

import * as path from 'path';
import * as Q from 'q';
import * as nopt from 'nopt';

import { DataSource, DataSourceJS, Dimension, Measure } from '../common/models/index';
import { DataSourceManager, dataSourceManagerFactory, loadFileSync, dataSourceToYAML, properDruidRequesterFactory, dataSourceFillerFactory } from './utils/index';

export interface PivotConfig {
  port?: number;
  verbose?: boolean;
  druidHost?: string;
  timeout?: number;
  introspectionStrategy?: string;
  sourceListScan?: string;
  sourceListRefreshInterval?: number;
  dataSources?: DataSourceJS[];

  hideGitHubIcon?: boolean;
  headerBackground?: string;
}

var packageObj = loadFileSync(path.join(__dirname, '../../package.json'), 'json') || {};
export const VERSION = packageObj.version;

function errorExit(e: Error): void {
  console.error(e.message);
  console.error((e as any).stack);
  process.exit(1);
}

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
  console.log(packageObj.version);
  process.exit();
}

const DEFAULT_CONFIG: PivotConfig = {
  port: 9090,
  sourceListScan: 'auto',
  sourceListRefreshInterval: 10000,
  dataSources: []
};

var exampleConfig: PivotConfig = null;
if (parsedArgs['example']) {
  delete parsedArgs['druid'];
  var example = parsedArgs['example'];
  if (example === 'wiki') {
    exampleConfig = loadFileSync(path.join(__dirname, `../../config-example-${example}.yaml`), 'yaml');
  } else {
    console.log(`Unknown example '${example}'. Possible examples are: wiki`);
    process.exit();
  }
}

if (!parsedArgs['example'] && !parsedArgs['config'] && !parsedArgs['druid'] && !parsedArgs['file']) {
  printUsage();
  process.exit();
}

var configFilePath = parsedArgs['config'];
var config: PivotConfig;
if (configFilePath) {
  config = loadFileSync(configFilePath, 'yaml');
  if (!config) {
    config = DEFAULT_CONFIG;
    console.log(`Could not load config from '${configFilePath}', using default`);
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

export const PORT = parseInt(parsedArgs['port'] || config.port, 10);
export const DRUID_HOST = parsedArgs['druid'] || config.druidHost;
export const TIMEOUT = parseInt(<any>config.timeout, 10) || 30000;

export const INTROSPECTION_STRATEGY = String(parsedArgs["introspection-strategy"] || config.introspectionStrategy || 'segment-metadata-fallback');
export const SOURCE_LIST_SCAN = START_SERVER ? config.sourceListScan : 'disable';
export const SOURCE_LIST_REFRESH_INTERVAL = START_SERVER ? (parseInt(<any>config.sourceListRefreshInterval, 10) || 10000) : 0;

export const HIDE_GITHUB_ICON = Boolean(config.hideGitHubIcon);
export const HEADER_BACKGROUND: string = config.headerBackground || null;

if (SOURCE_LIST_REFRESH_INTERVAL && SOURCE_LIST_REFRESH_INTERVAL < 1000) {
  errorExit(new Error('can not refresh more often than once per second'));
}

export const DATA_SOURCES: DataSource[] = (config.dataSources || []).map((dataSourceJS: DataSourceJS, i: number) => {
  if (typeof dataSourceJS !== 'object') errorExit(new Error(`DataSource ${i} is not valid`));
  var dataSourceName = dataSourceJS.name;
  if (typeof dataSourceName !== 'string') errorExit(new Error(`DataSource ${i} must have a name`));

  // Convert maxTime into refreshRule if a maxTime exists
  if (dataSourceJS.maxTime && (typeof dataSourceJS.maxTime === 'string' || (<any>dataSourceJS.maxTime).toISOString)) {
    dataSourceJS.refreshRule = { rule: 'fixed', time: <any>dataSourceJS.maxTime };
    console.warn('maxTime found in config, this is deprecated please convert it to a refreshRule like so:', dataSourceJS.refreshRule);
    delete dataSourceJS.maxTime;
  }

  try {
    return DataSource.fromJS(dataSourceJS);
  } catch (e) {
    errorExit(e);
  }
});

var druidRequester: Requester.PlywoodRequester<any> = null;
if (DRUID_HOST) {
  druidRequester = properDruidRequesterFactory({
    druidHost: DRUID_HOST,
    timeout: TIMEOUT,
    verbose: VERBOSE,
    concurrentLimit: 5
  });
}

var fileDirectory = path.join(__dirname, '../..');

export const DATA_SOURCE_MANAGER: DataSourceManager = dataSourceManagerFactory({
  dataSources: DATA_SOURCES,
  druidRequester,
  dataSourceFiller: dataSourceFillerFactory(druidRequester, fileDirectory, TIMEOUT, INTROSPECTION_STRATEGY),
  sourceListScan: SOURCE_LIST_SCAN,
  sourceListRefreshInterval: SOURCE_LIST_REFRESH_INTERVAL,
  log: PRINT_CONFIG ? null : (line: string) => console.log(line)
});

if (PRINT_CONFIG) {
  var withComments = Boolean(parsedArgs['with-comments']);
  var dataSourcesOnly = Boolean(parsedArgs['data-sources-only']);

  DATA_SOURCE_MANAGER.getQueryableDataSources().then((dataSources) => {
    var lines = [
      `# generated by Pivot version ${VERSION}`,
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

      if (INTROSPECTION_STRATEGY) {
        if (withComments) {
          lines.push("# Use the segmentMetadata query for introspection (only works well with Druid >= 0.8.2)");
        }
        lines.push(`noSegmentMetadata: true`, '');
      }

      lines.push("# Should new datasources automatically be added");
      lines.push(`sourceListScan: disable`, '');
    }

    if (dataSources.length) {
      lines.push('dataSources:');
      lines = lines.concat.apply(lines, dataSources.map(d => dataSourceToYAML(d, withComments)));
    } else {
      lines.push('dataSources: [] # Could not find any data sources please verify network connectivity');
    }

    console.log(lines.join('\n'));
  }).done();
}
