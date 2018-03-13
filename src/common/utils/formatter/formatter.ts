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

import { Timezone } from 'chronoshift';
import * as numeral from 'numeral';

import { $, LiteralExpression, NumberRange, TimeBucketExpression, TimeRange, TimeRangeExpression } from 'plywood';
import { STRINGS } from "../../../client/config/constants";

import { Dimension, Filter, FilterClause } from '../../models/index';
import { DisplayYear, formatTimeRange } from '../../utils/time/time';

export interface Formatter {
  (n: number): string;
}

const scales: Record<string, Record<string, number>> = {
  'a': {
    '': 1,
    'k': 1e3,
    'm': 1e6,
    'b': 1e9,
    't': 1e12
  },
  'b': {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024,
    'PB': 1024 * 1024 * 1024 * 1024 * 1024,
    'EB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    'ZB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    'YB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024
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
    const formatMiddle = numeral(middle).format('0 ' + formatType);
    const unit = formatMiddle.split(' ')[1] || '';
    const scale = scales[formatType][unit];
    const append = unit ? space + unit : '';

    return (n: number) => {
      if (isNaN(n) || !isFinite(n)) return '-';
      return numeral(n / scale).format(numberFormat) + append;
    };
  } else {
    return (n: number) => {
      if (isNaN(n) || !isFinite(n)) return '-';
      return numeral(n).format(format);
    };
  }
}

export function formatNumberRange(value: NumberRange) {
  return `${formatValue(value.start || `any`)} to ${formatValue(value.end || `any`)}`;
}

export function formatValue(value: any, timezone?: Timezone, displayYear?: DisplayYear): string {
  if (NumberRange.isNumberRange(value)) {
    return formatNumberRange(value);
  } else if (TimeRange.isTimeRange(value)) {
    return formatTimeRange(value, timezone, displayYear);
  } else {
    return '' + value;
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
    if (dimKind === 'time' && !verbose) return '';
    const delimiter = ["regex", "contains"].indexOf(clause.action) !== -1 ? ' ~' : ":";

    if (clauseSet && clauseSet.elements.length > 1 && !verbose) return `${dimTitle}`;
    return `${dimTitle}${delimiter}`;
  }

  switch (dimKind) {
    case 'boolean':
    case 'number':
    case 'string':
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
      if (clause.action === 'match') values = `/${values}/`;
      if (clause.action === Filter.CONTAINS) values = `"${values}"`;

      break;
    case 'time':
      values = getFormattedTimeClause(clause, timezone);
      break;
    default:
      throw new Error(`unknown kind ${dimKind}`);
  }

  return { title: getClauseLabel(), values };
}

export function getFormattedTimeClause(clause: FilterClause, timezone: Timezone): string {
  let values;

  if (clause.relative) {
    values = getRelativeTimeLabel(clause);
  } else {
    values = getFixedTimeRangeLabel(clause, timezone);
  }

  return values;
}

function getRelativeTimeLabel(clause: FilterClause): string {
  const { selection } = clause;

  if (selection instanceof TimeRangeExpression) {
    return getRelativeTimeRangeLabel(selection);
  } else if (selection instanceof TimeBucketExpression) {
    return getRelativeTimeBucketLabel(selection);
  } else {
    throw Error(`unsupported relative time filter clause: ${clause.selection}`);
  }
}

function getRelativeTimeRangeLabel(expression: TimeRangeExpression): string {
  const op = expression.getHeadOperand();
  let durationDescription = expression.getQualifiedDurationDescription();
  if (expression.duration.toString() === 'P3M') {
    durationDescription = "quarter";
  }

  if (op.equals($(FilterClause.MAX_TIME_REF_NAME)) && expression.step < 0) {
    return `${STRINGS.latest} ${durationDescription}`;
  } else if (op.equals($(FilterClause.NOW_REF_NAME)) && expression.step === -1) {
    return `${STRINGS.previous} ${durationDescription}`;
  } else {
    throw Error(`unsupported relative time filter expression: ${expression}`);
  }
}

function getRelativeTimeBucketLabel(expression: TimeBucketExpression): string {
  const op = expression.getHeadOperand();
  let durationDescription = expression.duration.getDescription();
  if (expression.duration.toString() === 'P3M') {
    durationDescription = "quarter";
  }

  if (op.equals($(FilterClause.NOW_REF_NAME))) {
    return `${STRINGS.current} ${durationDescription}`;
  } else {
    throw Error(`unsupported relative time filter expression: ${expression}`);
  }
}

function getFixedTimeRangeLabel(clause: FilterClause, timezone: Timezone): string {
  let values;
  const selection = (clause.selection as LiteralExpression);
  if (selection.type === 'TIME_RANGE') {
    const timeRange = selection.value as TimeRange;
    values = formatTimeRange(timeRange, timezone, DisplayYear.IF_DIFF);
  } else if (selection.type === "SET/TIME") {
    values = clause.getLiteralSet().toString();
  }
  return values;
}
