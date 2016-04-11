import * as filesaver from 'browser-filesaver';
import { Dataset, Set } from 'plywood';
import { setToString } from "../../../common/utils/general/general";

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
  filesaver.saveAs(blob, fileName);
}

export function datasetToFileString(dataset: Dataset, fileFormat?: FileFormat): string {
  if (fileFormat === 'csv') {
    return dataset.toCSV({
      formatter: {
        'SET/STRING': ((v: Set) => {
          return setToString(v, { encloseIn: ["\"[", "\"]"] });
        })
      }
    });
  } else if (fileFormat === 'tsv') {
    return dataset.toTSV({
      formatter: {
        'SET/STRING': ((v: Set) => {
          return setToString(v, { encloseIn: ["[", "]"] });
        })
      }
    });
  } else {
    return JSON.stringify(dataset.toJS(), null, 2);
  }
}
