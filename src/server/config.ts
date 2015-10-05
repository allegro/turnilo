'use strict';

import * as path from 'path';
import * as Q from 'q';

import { DataSource, DataSourceJS } from '../common/models/index';
import { DataSourceManager, dataSourceManagerFactory, loadFileSync } from './utils/index';

var env = process.env;
var packageObj = loadFileSync(path.join(__dirname, '../../package.json'), 'json');

var configFilePath = path.join(__dirname, '../../config.yaml');
var config: any = loadFileSync(configFilePath, 'yaml');
if (!config) {
  config = {};
  console.log(`Could not load config from '${configFilePath}'`);
}

function errorExit(e: Error): void {
  console.error(e.message);
  console.error((<any>e).stack);
  process.exit(1);
}

export const VERSION = packageObj.version;
export const PORT = parseInt(config.port || env.PIVOT_PORT, 10) || 9090;
export const DRUID_HOST = config.druidHost || env.PIVOT_DRUID_HOST;
export const USE_SEGMENT_METADATA = Boolean(config.useSegmentMetadata);
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
