import * as path from 'path';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';

var env = process.env;
var packageObj = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));
var config = yaml.safeLoad(readFileSync(path.join(__dirname, '../../config.yaml'), 'utf-8'));

export const VERSION = packageObj.version;
export const PORT = parseInt(config.port || env.PIVOT_PORT, 10) || 9090;
export const DRUID_HOST = String(config.druidHost || env.PIVOT_DRUID_HOST || 'localhost:8082');
export const DATA_SOURCES = config.dataSources;
