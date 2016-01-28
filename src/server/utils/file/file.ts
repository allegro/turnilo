'use strict';

import * as fs from 'fs';
import * as yaml from 'js-yaml';

export function loadFileSync(filepath: string, postProcess: string = null): any {
  var fileData = fs.readFileSync(filepath, 'utf-8');
  if (postProcess === 'json') {
    fileData = JSON.parse(fileData);
  } else if (postProcess === 'yaml') {
    fileData = yaml.safeLoad(fileData);
  }

  return fileData;
}
