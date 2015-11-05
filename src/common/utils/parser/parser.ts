'use strict';

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
