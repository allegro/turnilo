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

import { Datum } from "plywood";
import * as React from "react";
import { DataSeries } from "../../../common/models/data-series/data-series";
import { SeriesDerivation } from "../../../common/models/series/series-definition";
import { Delta } from "../delta/delta";
import "./vis-measure-label.scss";

export interface VisMeasureLabelProps {
  series: DataSeries;
  datum: Datum;
  showPrevious: boolean;
}

function renderPrevious(datum: Datum, series: DataSeries): JSX.Element {
  return <React.Fragment>
    <span className="measure-previous-value">
      {series.formatValue(datum, SeriesDerivation.PREVIOUS)}
      </span>
    <Delta datum={datum} series={series} />
  </React.Fragment>;
}

export const VisMeasureLabel: React.SFC<VisMeasureLabelProps> = ({ series, datum, showPrevious }) => {
  return <div className="vis-measure-label">
    <span className="measure-title">{series.measure.title}</span>
    <span className="colon">: </span>
    <span className="measure-value">{series.formatValue(datum)}</span>
    {showPrevious && renderPrevious(datum, series)}
  </div>;
};
