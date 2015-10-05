'use strict';

import * as fs from 'fs';
import * as yaml from 'js-yaml';

export function loadFileSync(filepath: string, postprocess: string = null): any {
  var fileData: any = null;
  try {
    fileData = fs.readFileSync(filepath, 'utf-8');
    if (postprocess === 'json') {
      fileData = JSON.parse(fileData);
    } else if (postprocess === 'yaml') {
      fileData = yaml.safeLoad(fileData);
    }
  } catch (e) {
    return null;
  }

  return fileData;
}
