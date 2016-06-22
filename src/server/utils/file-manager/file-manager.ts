import * as path from 'path';
import * as Q from 'q';
import * as fs from 'fs-promise';
import { Dataset, Expression, PseudoDatum } from 'plywood';
import { Logger } from '../logger/logger';
import { parseData } from '../../../common/utils/parser/parser';


export function getFileData(filePath: string): Q.Promise<any[]> {
  return fs.readFile(filePath, 'utf-8')
    .then((fileData) => {
      try {
        return parseData(fileData, path.extname(filePath));
      } catch (e) {
        throw new Error(`could not parse '${filePath}': ${e.message}`);
      }
    })
    .then((fileJSON) => {
      fileJSON.forEach((d: PseudoDatum) => {
        d['time'] = new Date(d['time']);
      });
      return fileJSON;
    });
}

export interface FileManagerOptions {
  logger: Logger;
  verbose?: boolean;
  anchorPath: string;
  uri: string;
  subsetFilter?: Expression;
  onDatasetChange?: (dataset: Dataset) => void;
}

function noop() {}

export class FileManager {
  public logger: Logger;
  public verbose: boolean;
  public anchorPath: string;
  public uri: string;
  public dataset: Dataset;
  public subsetFilter: Expression;
  public onDatasetChange: (dataset: Dataset) => void;

  constructor(options: FileManagerOptions) {
    this.logger = options.logger;
    this.verbose = Boolean(options.verbose);
    this.anchorPath = options.anchorPath;
    this.uri = options.uri;
    this.subsetFilter = options.subsetFilter;
    this.verbose = Boolean(options.verbose);
    this.onDatasetChange = options.onDatasetChange || noop;
  }

  // Do initialization
  public init(): Q.Promise<any> {
    const { logger, anchorPath, uri } = this;

    var filePath = path.resolve(anchorPath, uri);

    logger.log(`Loading file ${filePath}`);
    return getFileData(filePath)
      .then(
        (rawData) => {
          logger.log(`Loaded file ${filePath} (rows = ${rawData.length})`);
          var dataset = Dataset.fromJS(rawData).hide();

          if (this.subsetFilter) {
            dataset = dataset.filter(this.subsetFilter.getFn(), {});
          }

          this.dataset = dataset;
          this.onDatasetChange(dataset);
        },
        (e) => {
          logger.error(`Field to load file ${filePath} because ${e.message}`);
        }
      );
  }

  public destroy(): void {
    // Nothing here for now
  }
}
