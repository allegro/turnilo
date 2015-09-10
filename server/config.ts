import * as path from 'path';
import { readFileSync } from 'fs';

function getVersion(): string {
  try {
    var packageObj = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
    return packageObj.version;
  } catch (e) {
    return 'v0.0.0';
  }
}

export const VERSION = getVersion();
