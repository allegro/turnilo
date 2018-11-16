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

import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { customFormat, DEFAULT_FORMAT, EXACT_FORMAT, PERCENT_FORMAT, SeriesFormat, SeriesFormatType } from "../../../common/models/series/series";
import { exactFormat, percentFormat } from "../../../common/utils/formatter/formatter";
import { concatTruthy, Unary } from "../../../common/utils/functional/functional";
import { STRINGS } from "../../config/constants";
import { InputWithPresets, Preset } from "../input-with-presets/input-with-presets";

interface FormatPickerProps {
  measure: Measure;
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

export const FormatPicker: React.SFC<FormatPickerProps> = ({ format, measure, formatChange }) => {
  const measureFormat = measure.getFormat();

  const formatPresets: Preset[] = concatTruthy(
    { name: "Default", identity: measureFormat },
    measureFormat !== exactFormat && { name: "Exact", identity: exactFormat },
    { name: "Percent", identity: percentFormat }
  );

  function onFormatChange(format: string) {
    formatChange(readFormat(format, measureFormat));
  }

  return <InputWithPresets
    presets={formatPresets}
    title={STRINGS.format}
    selected={printFormat(format, measureFormat)}
    onChange={onFormatChange} />;
};
