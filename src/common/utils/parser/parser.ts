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

import * as d3 from 'd3';

export function parseCSV(text: string): any[] {
  return d3.csv.parse(text);
}

export function parseTSV(text: string): any[] {
  return d3.tsv.parse(text);
}

export function parseJSON(text: string): any[] {
  text = text.trim();
  var firstChar = text[0];

  if (firstChar[0] === '[') {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`could not parse`);
    }

  } else if (firstChar[0] === '{') { // Also support line json
    return text.split(/\r?\n/).map((line, i) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        throw new Error(`problem in line: ${i}: '${line}'`);
      }
    });

  } else {
    throw new Error(`Unsupported start, starts with '${firstChar[0]}'`);

  }
}

export function parseData(text: string, type: string): any[] {
  type = type.replace('.', '');
  switch (type) {
    case 'csv':
    case 'text/csv':
      return parseCSV(text);

    case 'tsv':
    case 'text/tsv':
    case 'text/tab-separated-values':
      return parseTSV(text);

    case 'json':
    case 'application/json':
      return parseJSON(text);

    default:
      throw new Error(`Unsupported file type '${type}'`);
  }
}
