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

import { Duration, Timezone } from "chronoshift";
import * as numeral from "numeral";

import { $, LiteralExpression, NumberRange, TimeRange, TimeRangeExpression } from "plywood";
import { STRINGS } from "../../../client/config/constants";

import { Dimension, Filter, FilterClause, FilterSelection } from "../../models";
import { DisplayYear, formatTimeRange } from "../../utils/time/time";

export type Formatter = (n: number) => string;

const scales: Record<string, Record<string, number>> = {
  a: {
    "": 1,
    "k": 1e3,
    "m": 1e6,
    "b": 1e9,
    "t": 1e12
  },
  b: {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
    PB: 1024 * 1024 * 1024 * 1024 * 1024,
    EB: 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    ZB: 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    YB: 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024
  }
};

export function getMiddleNumber(values: number[]): number {
  const filteredAbsData: number[] = [];
  for (let v of values) {
    if (v === 0 || isNaN(v) || !isFinite(v)) continue;
    filteredAbsData.push(Math.abs(v));
  }

  const n = filteredAbsData.length;
  if (n) {
    filteredAbsData.sort((a, b) => b - a);
    return filteredAbsData[Math.ceil((n - 1) / 2)];
  } else {
    return 0;
  }
}

export function formatterFromData(values: number[], format: string): Formatter {
  const match = format.match(/^(\S*)( ?)([ab])$/);
  if (match) {
    const numberFormat = match[1];
    const space = match[2];
    const formatType = match[3];
    const middle = getMiddleNumber(values);
    const formatMiddle = numeral(middle).format("0 " + formatType);
    const unit = formatMiddle.split(" ")[1] || "";
    const scale = scales[formatType][unit];
    const append = unit ? space + unit : "";

    return (n: number) => {
      if (isNaN(n) || !isFinite(n)) return "-";
      return numeral(n / scale).format(numberFormat) + append;
    };
  } else {
    return (n: number) => {
      if (isNaN(n) || !isFinite(n)) return "-";
      return numeral(n).format(format);
    };
  }
}

export function formatNumberRange(value: NumberRange) {
  return `${formatValue(value.start || "any")} to ${formatValue(value.end || "any")}`;
}

export function formatValue(value: any, timezone?: Timezone, displayYear?: DisplayYear): string {
  if (NumberRange.isNumberRange(value)) {
    return formatNumberRange(value);
  } else if (TimeRange.isTimeRange(value)) {
    return formatTimeRange(value, timezone, displayYear);
  } else {
    return "" + value;
  }
}

export function formatFilterClause(dimension: Dimension, clause: FilterClause, timezone: Timezone, verbose?: boolean): string {
  const { title, values } = this.getFormattedClause(dimension, clause, timezone, verbose);
  return title ? `${title} ${values}` : values;
}

export function getFormattedClause(dimension: Dimension, clause: FilterClause, timezone: Timezone, verbose?: boolean): { title: string, values: string } {
  const dimKind = dimension.kind;
  let values: string;
  const clauseSet = clause.getLiteralSet();

  function getClauseLabel() {
    const dimTitle = dimension.title;
    if (dimKind === "time" && !verbose) return "";
    const delimiter = ["regex", "contains"].indexOf(clause.action) !== -1 ? " ~" : ":";

    if (clauseSet && clauseSet.elements.length > 1 && !verbose) return `${dimTitle}`;
    return `${dimTitle}${delimiter}`;
  }

  switch (dimKind) {
    case "boolean":
    case "number":
    case "string":
      if (verbose) {
        values = clauseSet.toString();
      } else {
        const setElements = clauseSet.elements;
        if (setElements.length > 1) {
          values = `(${setElements.length})`;
        } else {
          values = formatValue(setElements[0]);
        }
      }
      if (clause.action === "match") values = `/${values}/`;
      if (clause.action === Filter.CONTAINS) values = `"${values}"`;

      break;
    case "time":
      values = getFormattedTimeClauseValues(clause, timezone);
      break;
    default:
      throw new Error(`unknown kind ${dimKind}`);
  }

  return { title: getClauseLabel(), values };
}

const $now = $(FilterClause.NOW_REF_NAME);
const $max = $(FilterClause.MAX_TIME_REF_NAME);

function getFormattedTimeClauseValues(clause: FilterClause, timezone: Timezone): string {
  const { relative, selection } = clause;

  if (isLatestDuration(relative, selection)) {
    return `${STRINGS.latest} ${getQualifiedDurationDescription(selection)}`;
  } else if (isPreviousDuration(relative, selection)) {
    return `${STRINGS.previous} ${getQualifiedDurationDescription(selection)}`;
  } else if (isCurrentDuration(relative, selection)) {
    return `${STRINGS.current} ${getQualifiedDurationDescription(selection)}`;
  } else if (selection instanceof LiteralExpression && selection.value instanceof TimeRange) {
    return formatTimeRange(selection.value, timezone, DisplayYear.IF_DIFF);
  } else {
    throw Error(`unsupported time filter clause: ${clause.selection}`);
  }
}

function isLatestDuration(isRelative: boolean, selection: FilterSelection): selection is TimeRangeExpression {
  function isEarlierTimeRange(selection: TimeRangeExpression) {
    return selection.step < 0;
  }

  return isRelative
    && selection instanceof TimeRangeExpression
    && selection.getHeadOperand().equals($max)
    && isEarlierTimeRange(selection);
}

function isCurrentDuration(isRelative: boolean, selection: FilterSelection): selection is TimeRangeExpression {
  function isCurrentTimeRange(selection: TimeRangeExpression) {
    return selection.step === 1;
  }

  return isRelative
    && selection instanceof TimeRangeExpression
    && selection.getHeadOperand().equals($now)
    && isCurrentTimeRange(selection);
}

function isPreviousDuration(isRelative: boolean, selection: FilterSelection): selection is TimeRangeExpression {
  function isPreviousTimeRange(selection: TimeRangeExpression) {
    return selection.step === -1;
  }

  return isRelative
    && selection instanceof TimeRangeExpression
    && selection.getHeadOperand().equals($now)
    && isPreviousTimeRange(selection);
}

function getQualifiedDurationDescription(selection: TimeRangeExpression) {
  return normalizeDurationDescription(selection.getQualifiedDurationDescription(), selection.duration);
}

function normalizeDurationDescription(description: string, duration: Duration) {
  if (duration.toString() === "P3M") {
    return STRINGS.quarter.toLowerCase();
  } else {
    return description;
  }
}
