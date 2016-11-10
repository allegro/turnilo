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

import * as filesaver from 'browser-filesaver';
import { Dataset } from 'plywood';

export type FileFormat = "csv" | "tsv" | "json" | "txt";

export function getMIMEType(fileType: string) {
  switch (fileType) {
    case 'csv':
      return 'text/csv';
    case 'tsv':
      return 'text/tsv';
    default:
      return 'application/json';
  }
}

export function download(dataset: Dataset, fileName?: string, fileFormat?: FileFormat): void {
  const type = `${getMIMEType(fileFormat)};charset=utf-8`;
  const blob = new Blob([datasetToFileString(dataset, fileFormat)], {type});
  if (!fileName) fileName = `${new Date()}-data`;
  fileName += `.${fileFormat}`;
  filesaver.saveAs(blob, fileName, true); // true == disable auto BOM
}

export function datasetToFileString(dataset: Dataset, fileFormat?: FileFormat): string {
  if (fileFormat === 'csv') {
    return dataset.toCSV();
  } else if (fileFormat === 'tsv') {
    return dataset.toTSV();
  } else {
    return JSON.stringify(dataset.toJS(), null, 2);
  }
}

export function makeFileName(...args: Array<string>): string {
  var nameComponents: string[] = [];
  args.forEach((arg) => {
    if (arg) nameComponents.push(arg.toLowerCase());
  });
  var nameString = nameComponents.join("_");
  return nameString.length < 200 ? nameString : nameString.substr(0, 200);
}

