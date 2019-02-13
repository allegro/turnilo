import { Timezone } from "chronoshift";
/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import { day } from "chronoshift";
import * as filesaver from "file-saver";
import * as moment from "moment";
import { Dataset, DatasetJSFull, TimeRange } from "plywood";
import * as xlsx from "xlsx-exporter";
import { Essence } from "../../../common/models/essence/essence";
import { FixedTimeFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Filter } from "../../../common/models/filter/filter";
import {  formatDate, formatDateWithoutTime, formatValue } from "../../../common/utils/formatter/formatter";
import { complement } from "../../../common/utils/functional/functional";
import { isBlank } from "../../../common/utils/general/general";
import { DataSetWithTabOptions } from "../../views/cube-view/cube-view";

export type FileFormat = "csv" | "tsv" | "json" | "xlsx";

export function getMIMEType(fileType: string) {
  switch (fileType) {
    case "csv":
      return "text/csv";
    case "tsv":
      return "text/tsv";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    default:
      return "application/json";
  }
}

export function download(
  { essence, dataset, options }: DataSetWithTabOptions,
  fileFormat: FileFormat,
  fileName?: string
): void {
  const type = `${getMIMEType(fileFormat)};charset=utf-8`;
  datasetToWritableValue(essence, dataset, fileFormat).then(writableValue => {
    const blob = new Blob([writableValue], {
      type
    });

    if (!fileName) fileName = `${new Date()}-data`;
    fileName += `.${fileFormat}`;
    filesaver.saveAs(blob, fileName, true); // true == disable auto BOM
  });
}

export async function datasetToWritableValue(
  essence: Essence,
  dataset: Dataset,
  fileFormat: FileFormat
) {
  if (fileFormat === "csv") {
    return datasetToSeparatedValues(essence, dataset, ",");
  } else if (fileFormat === "tsv") {
    return datasetToSeparatedValues(essence, dataset, "\t");
  } else if (fileFormat === "xlsx") {
    return datasetToXLSX(essence, dataset);
  } else {
    const datasetJS = dataset.toJS() as DatasetJSFull;
    return JSON.stringify(datasetJS.data, null, 2);
  }
}

function dateToFileString(date: Date): string {
  return moment(date).format("YYYY-MM-DD_HH_mm_ss");
}

export function dateFromFilter(filter: Filter): string {
  const timeFilter: FixedTimeFilterClause = filter.clauses.find(clause => clause instanceof FixedTimeFilterClause) as FixedTimeFilterClause;
  if (!timeFilter) return "";
  const { start, end } = timeFilter.values.first();
  return `${dateToFileString(start)}_${dateToFileString(end)}`;
}

export function makeFileName(...nameComponents: string[]): string {
  return nameComponents
    .filter(complement(isBlank))
    .map(name => name.toLowerCase())
    .join("_")
    .substr(0, 200);
}

function datasetToSeparatedValues(
  essence: Essence,
  dataset: Dataset,
  separator: string
): string {
  return datasetToRows(essence, dataset)
    .map(row => {
      return row
        .map((value: any) => {
          let formatted: string;
          if (TimeRange.isTimeRange(value)) {
            formatted = formatTimeRange(value, essence.timezone);
          } else {
            formatted = formatValue(value);
          }
          return `"${formatted}"`;
        })
        .join(separator);
    })
    .join("\n");
}

function datasetToRows(essence: Essence, dataset: Dataset): any[] {
  const rows: any[] = [];
  const segmentNames: string[] = [];
  const measureNames: string[] = [];
  const columnHeadings: string[] = [];

  essence.splits.splits.forEach(split => {
    const dimension = essence.dataCube.dimensions.getDimensionByName(split.reference);
    segmentNames.push(dimension.name);
    columnHeadings.push(dimension.title);
  });

  essence
    .getEffectiveSelectedMeasures()
    .toArray()
    .forEach(measure => {
      measureNames.push(measure.name);
      columnHeadings.push(measure.title);
    });

  rows.push(columnHeadings);
  dataset.flatten().data.forEach(row => {
    const values: any[] = [];
    for (const segment of segmentNames) {
      values.push(row[segment]);
    }
    for (const measure of measureNames) {
      values.push(row[measure]);
    }
    rows.push(values);
  });

  return rows;
}

function datasetToXLSX(
  essence: Essence,
  dataset: Dataset
) {
  const workbook = new xlsx.Workbook();

  const data = datasetToRows(essence, dataset).map(row => {
    return row.map((value: any) => {
      if (TimeRange.isTimeRange(value)) {
        return formatTimeRange(value, essence.timezone);
      }
      return value;
    });
  });

  const worksheet = new xlsx.Worksheet(data);
  workbook.addWorksheet(worksheet);

  return workbook.save();
}

function formatTimeRange(value: TimeRange, timezone: Timezone) {
  if (value.end.valueOf() >= day.shift(value.start, timezone, 1).valueOf()) {
    return formatDateWithoutTime(value.start, timezone);
  } else {
    return formatDate(value.start, timezone);
  }
}
