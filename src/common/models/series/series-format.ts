/*
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

import { Record } from "immutable";
import numbro from "numbro";
import { Unary } from "../../utils/functional/functional";
import { isFiniteNumber, isNumber } from "../../utils/general/general";
import { Measure } from "../measure/measure";

export enum SeriesFormatType { DEFAULT = "default", EXACT = "exact", PERCENT = "percent", CUSTOM = "custom" }

type FormatString = string;

interface SeriesFormatValue {
  type: SeriesFormatType;
  value: FormatString;
}

const defaultFormat: SeriesFormatValue = { type: SeriesFormatType.DEFAULT, value: "" };

export class SeriesFormat extends Record<SeriesFormatValue>(defaultFormat) {
  static fromJS(params: any): SeriesFormat {
    return new SeriesFormat(params);
  }
}

export const DEFAULT_FORMAT = new SeriesFormat(defaultFormat);
export const EXACT_FORMAT = new SeriesFormat({ type: SeriesFormatType.EXACT });
export const PERCENT_FORMAT = new SeriesFormat({ type: SeriesFormatType.PERCENT });

export const customFormat = (value: string) => new SeriesFormat({ type: SeriesFormatType.CUSTOM, value });

export function formatFnFactory(format: string): (n: number) => string {
  return (n: number) => {
    if (!isNumber(n) || !isFiniteNumber(n)) return "-";
    return numbro(n).format(format);
  };
}

export const exactFormat = "0,0";
const exactFormatter = formatFnFactory(exactFormat);
export const percentFormat = "0[.]00%";
const percentFormatter = formatFnFactory(percentFormat);
export const measureDefaultFormat = "0,0.0 a";
export const defaultFormatter = formatFnFactory(measureDefaultFormat);

export function seriesFormatter(format: SeriesFormat, measure: Measure): Unary<number, string> {
  switch (format.type) {
    case SeriesFormatType.DEFAULT:
      return formatFnFactory(measure.format);
    case SeriesFormatType.EXACT:
      return exactFormatter;
    case SeriesFormatType.PERCENT:
      return percentFormatter;
    case SeriesFormatType.CUSTOM:
      return formatFnFactory(format.value);
  }
}
