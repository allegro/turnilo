import * as path from 'path';
import { readFileSync } from 'fs';
import * as Q from 'q';
import * as yaml from 'js-yaml';

import { DataSource, DataSourceJS } from '../common/models/index';
import { fillInDataSource } from './utils/index';
import { druidRequesterFactory } from 'plywood-druid-requester';

var env = process.env;
var packageObj = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));
var config = yaml.safeLoad(readFileSync(path.join(__dirname, '../../config.yaml'), 'utf-8'));

function errorExit(message: string): void {
  console.error(message);
  process.exit(1);
}

export const VERSION = packageObj.version;
export const PORT = parseInt(config.port || env.PIVOT_PORT, 10) || 9090;
export const DRUID_HOST = String(config.druidHost || env.PIVOT_DRUID_HOST || 'localhost:8082');

var druidRequester = druidRequesterFactory({
  host: DRUID_HOST,
  timeout: 30000
});

//druidRequester = helper.verboseRequesterFactory({
//  requester: druidRequester
//});

var dataSourcePromises = config.dataSources.map((dataSourceJS: DataSourceJS, i: number) => {
  if (typeof dataSourceJS !== 'object') errorExit(`DataSource ${i} is not valid`);
  var dataSourceName = dataSourceJS.name;
  if (typeof dataSourceName !== 'string') errorExit(`DataSource ${i} must have a name`);

  try {
    return fillInDataSource(DataSource.fromJS(dataSourceJS), druidRequester);
  } catch (e) {
    errorExit(e.message);
  }
});

export const DATA_SOURCES: Q.Promise<DataSource[]> = Q.all(dataSourcePromises).catch((e): DataSource[] => {
  errorExit(e.message);
  return null;
});
