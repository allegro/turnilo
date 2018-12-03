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

export enum SeriesDerivation { CURRENT = "", PREVIOUS = "previous", DELTA = "delta" }

export function readMeasureDerivation(str: string): SeriesDerivation {
  if (str === SeriesDerivation.CURRENT) return SeriesDerivation.CURRENT;
  if (str === SeriesDerivation.PREVIOUS) return SeriesDerivation.PREVIOUS;
  if (str === SeriesDerivation.DELTA) return SeriesDerivation.DELTA;
  return null;
}

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

export interface SeriesPercentsValue {
  ofParent: boolean;
  ofTotal: boolean;
}

const defaultPercents: SeriesPercentsValue = { ofParent: false, ofTotal: false };

export class SeriesPercents extends Record<SeriesPercentsValue>(defaultPercents) {
}

export const DEFAULT_PERCENTS = new SeriesPercents(defaultPercents);

interface SeriesValue {
  reference: string;
  format: SeriesFormat;
  percents: SeriesPercents;
}

const defaultSeries: SeriesValue = {
  reference: null,
  format: DEFAULT_FORMAT,
  percents: DEFAULT_PERCENTS
};

export class Series extends Record<SeriesValue>(defaultSeries) {
  static fromMeasure(measure: Measure) {
    return new Series({ reference: measure.name });
  }

  static fromJS({ reference, format, percents }: any) {
    return new Series({
      reference,
      format: new SeriesFormat(format),
      percents: new SeriesPercents(percents)
    });
  }
}
