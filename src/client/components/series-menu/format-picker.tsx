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

import React from "react";
import { ClientMeasure } from "../../../common/models/measure/measure";
import {
  customFormat,
  DEFAULT_FORMAT,
  EXACT_FORMAT,
  exactFormat,
  measureDefaultFormat,
  PERCENT_FORMAT,
  percentFormat,
  SeriesFormat,
  seriesFormatter,
  SeriesFormatType
} from "../../../common/models/series/series-format";
import { concatTruthy, Unary } from "../../../common/utils/functional/functional";
import { STRINGS } from "../../config/constants";
import { StringInputWithPresets } from "../input-with-presets/string-input-with-presets";

const PREVIEW_VALUE = 23667.25431;

interface FormatPickerProps {
  measure: ClientMeasure;
  format: SeriesFormat;
  formatChange: Unary<SeriesFormat, void>;
}

function readFormat(format: string, measureFormat: string): SeriesFormat {
  switch (format) {
    case measureFormat:
      return DEFAULT_FORMAT;
    case exactFormat:
      return EXACT_FORMAT;
    case percentFormat:
      return PERCENT_FORMAT;
    default:
      return customFormat(format);
  }
}

function printFormat(format: SeriesFormat, measureFormat: string): string {
  switch (format.type) {
    case SeriesFormatType.DEFAULT:
      return measureFormat;
    case SeriesFormatType.EXACT:
      return exactFormat;
    case SeriesFormatType.PERCENT:
      return percentFormat;
    case SeriesFormatType.CUSTOM:
      return format.value;
  }
}

export const FormatPicker: React.FunctionComponent<FormatPickerProps> = ({ format, measure, formatChange }) => {
  const measureFormat = measure.format;

  const formatPresets = concatTruthy(
    { name: "Default", identity: measureFormat },
    measureFormat !== exactFormat && { name: "Exact", identity: exactFormat },
    { name: "Percent", identity: percentFormat }
  );

  function onFormatChange(format: string) {
    formatChange(readFormat(format, measureFormat));
  }

  return <React.Fragment>
    <StringInputWithPresets
      presets={formatPresets}
      title={STRINGS.format}
      selected={printFormat(format, measureFormat)}
      placeholder={`Custom format e.g. ${measureDefaultFormat}`}
      onChange={onFormatChange} />
    {format.type === SeriesFormatType.CUSTOM && <div className="format-hint">
      You can use custom numbro format to present measure values.
      Please refer to the <a target="_blank" className="documentation-link" href="https://numbrojs.com/old-format.html">numbro documentation</a>
    </div>}
    <div className="preview">
      <span className="value">{PREVIEW_VALUE} → </span>
      <span className="formatted">{seriesFormatter(format, measure)(PREVIEW_VALUE)}</span>
    </div>
  </React.Fragment>;
};
