/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import * as fileSaver from "file-saver";
import { Dataset, TabulatorOptions } from "plywood";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import tabularOptions from "../tabular-options/tabular-options";

export type FileFormat = "csv" | "tsv";

export function getMIMEType(fileType: FileFormat) {
  switch (fileType) {
    case "csv":
      return "text/csv";
    case "tsv":
      return "text/tsv";
  }
}

function saveFile(part: string | Buffer, fileName: string, fileFormat: FileFormat, fileEncoding: string) {
  const type = `${getMIMEType(fileFormat)};charset=${fileEncoding}`;
  const blob = new Blob([part], { type });
  fileSaver.saveAs(blob, `${fileName}.${fileFormat}`, true);
}

function encodeContent(content: string, encoding: string): Promise<string | Buffer> {
  if (encoding === "utf-8") return Promise.resolve(content);
  return import(/* webpackChunkName: "iconv-lite" */ "iconv-lite").then(iconv => iconv.encode(content, encoding));
}

export function download(dataset: Dataset, essence: Essence, fileFormat: FileFormat, fileName: string, fileEncoding: string) {
  const result = datasetToFileString(dataset, fileFormat, tabularOptions(essence));
  encodeContent(result, fileEncoding).then(content => {
    saveFile(content, fileName, fileFormat, fileEncoding);
  });
}

export function datasetToFileString(dataset: Dataset, fileFormat: FileFormat, options?: TabulatorOptions): string {
  switch (fileFormat) {
    case "csv":
      return dataset.toCSV(options);
    case "tsv":
      return dataset.toTSV(options);
  }
}

export function fileNameBase(essence: Essence, timekeeper: Timekeeper): string {
  return essence.description(timekeeper);
}
