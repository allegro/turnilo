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
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { QuantileSeries } from "../../../common/models/series/quantile-series";
import { Series } from "../../../common/models/series/series";
import { SeriesFormat } from "../../../common/models/series/series-format";
import { Binary } from "../../../common/utils/functional/functional";
import { Preset } from "../input-with-presets/input-with-presets";
import { FormatPicker } from "./format-picker";
import { QuantilePicker } from "./quantile-picker";
import "./quantile-series-menu.scss";

interface QuantileSeriesMenuProps {
  measure: Measure;
  initialSeries: Series;
  series: QuantileSeries;
  seriesList: SeriesList;
  onChange: Binary<QuantileSeries, boolean, void>;
}

const percentiles: Array<Preset<number>> = [
  { identity: 50, name: "50" },
  { identity: 75, name: "75" },
  { identity: 90, name: "90" },
  { identity: 95, name: "95" },
  { identity: 99, name: "99" }
];

export const QuantileSeriesMenu: React.FunctionComponent<QuantileSeriesMenuProps> = ({ seriesList, initialSeries, measure, series, onChange }) => {

  const otherSeries = seriesList.removeSeries(initialSeries);

  function validateSeries(series: QuantileSeries): string | null {
    if (series.percentile <= 0 || series.percentile >= 100) {
      return "Percentile must be a number greater than 0 and lower than 100";
    }
    if (otherSeries.hasSeriesWithKey(series.key())) {
      return "This percentile is already define for this measure";
    }
    return null;
  }

  function isSeriesValid(series: QuantileSeries) {
    return validateSeries(series) === null;
  }

  function onSeriesChange(series: QuantileSeries) {
    onChange(series, isSeriesValid(series));
  }

  function onFormatChange(format: SeriesFormat) {
    onSeriesChange(series.set("format", format));
  }

  function onPercentileChange(percentile: number) {
    onSeriesChange(series.set("percentile", percentile));
  }

  const error = validateSeries(series);

  return <React.Fragment>
    <div className="percentile-picker">
      <QuantilePicker
        title="Percentile"
        placeholder="Type percentile e.g. 55"
        selected={series.percentile}
        presets={percentiles}
        errorMessage={error}
        onChange={onPercentileChange} />
    </div>
    <FormatPicker
      measure={measure}
      format={series.format}
      formatChange={onFormatChange}
    />
  </React.Fragment>;
};
