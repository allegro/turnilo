/*
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

import { Record } from "immutable";
import { Measure } from "../measure/measure";

export enum SeriesFormatType { DEFAULT = "default", EXACT = "exact", PERCENT = "percent", CUSTOM = "custom" }

type FormatString = string;

interface SeriesFormatValue {
  type: SeriesFormatType;
  value: FormatString;
}

const defaultFormat: SeriesFormatValue = { type: SeriesFormatType.DEFAULT, value: "" };

export class SeriesFormat extends Record<SeriesFormatValue>(defaultFormat) {
}

export const DEFAULT_FORMAT = new SeriesFormat(defaultFormat);
export const EXACT_FORMAT = new SeriesFormat({ type: SeriesFormatType.EXACT });
export const PERCENT_FORMAT = new SeriesFormat({ type: SeriesFormatType.PERCENT });

export const customFormat = (value: string) => new SeriesFormat({ type: SeriesFormatType.CUSTOM, value });

interface SeriesValue {
  reference: Measure;
  format: SeriesFormat;
}

const defaultSeries: SeriesValue = { reference: null, format: DEFAULT_FORMAT };

export class Series extends Record<SeriesValue>(defaultSeries) {
  static fromMeasure(measure: Measure) {
    return new Series({ reference: measure });
  }

  static fromJS({ reference, format }: any) {
    return new Series({ reference, format: new SeriesFormat(format) });
  }
}
