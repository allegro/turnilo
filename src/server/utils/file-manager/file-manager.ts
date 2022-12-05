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

import * as fse from "fs-extra";
import * as path from "path";
import { Dataset, Expression, PseudoDatum } from "plywood";
import { Logger } from "../../../common/logger/logger";
import { noop } from "../../../common/utils/functional/functional";
import { parseData } from "../parser/parser";

export function getFileData(filePath: string): Promise<any[]> {
  return fse.readFile(filePath, "utf-8")
    .then(fileData => {
      try {
        return parseData(fileData, path.extname(filePath));
      } catch (e) {
        throw new Error(`could not parse '${filePath}': ${e.message}`);
      }
    })
    .then(fileJSON => {
      fileJSON.forEach((d: PseudoDatum) => {
        d["time"] = new Date(d["time"]);
      });
      return fileJSON;
    });
}

export interface FileManagerOptions {
  logger: Logger;
  verbose?: boolean;
  anchorPath: string;
  uri: string;
  subsetExpression?: Expression;
  onDatasetChange?: (dataset: Dataset) => void;
}

export class FileManager {
  public logger: Logger;
  public verbose: boolean;
  public anchorPath: string;
  public uri: string;
  public dataset: Dataset;
  public subsetExpression: Expression;
  public onDatasetChange: (dataset: Dataset) => void;

  constructor(options: FileManagerOptions) {
    this.logger = options.logger;
    this.verbose = Boolean(options.verbose);
    this.anchorPath = options.anchorPath;
    this.uri = options.uri;
    this.subsetExpression = options.subsetExpression;
    this.verbose = Boolean(options.verbose);
    this.onDatasetChange = options.onDatasetChange || noop;
  }

  // Do initialization
  public init(): Promise<void> {
    const { logger, anchorPath, uri } = this;

    const filePath = path.resolve(anchorPath, uri);

    logger.log(`Loading file ${filePath}`);
    return getFileData(filePath)
      .then(
        rawData => {
          logger.log(`Loaded file ${filePath} (rows = ${rawData.length})`);
          let dataset = Dataset.fromJS(rawData).hide();

          if (this.subsetExpression) {
            dataset = dataset.filter(this.subsetExpression);
          }

          this.dataset = dataset;
          this.onDatasetChange(dataset);
        },
        e => {
          logger.error(`Failed to load file ${filePath} because: ${e.message}`);
        }
      );
  }

  public destroy(): void {
    // Nothing here for now
  }
}
