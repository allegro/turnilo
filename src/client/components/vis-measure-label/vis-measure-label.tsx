/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Datum } from "plywood";
import React from "react";
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";
import { Delta } from "../delta/delta";
import "./vis-measure-label.scss";

export interface VisMeasureLabelProps {
  series: ConcreteSeries;
  datum: Datum;
  showPrevious: boolean;
}

function renderPrevious(datum: Datum, series: ConcreteSeries): JSX.Element {
  const current = series.selectValue(datum, SeriesDerivation.CURRENT);
  const previous = series.selectValue(datum, SeriesDerivation.PREVIOUS);
  const formatter = series.formatter();
  return <React.Fragment>
    <span className="measure-previous-value">
      {formatter(previous)}
      </span>
    <Delta
      formatter={formatter}
      lowerIsBetter={series.measure.lowerIsBetter}
      currentValue={current}
      previousValue={previous} />
  </React.Fragment>;
}

export const VisMeasureLabel: React.FunctionComponent<VisMeasureLabelProps> = ({ series, datum, showPrevious }) => {
  return <div className="vis-measure-label">
    <span className="measure-title">{series.title()}</span>
    <span className="colon">: </span>
    <span className="measure-value">{series.formatValue(datum)}</span>
    {showPrevious && renderPrevious(datum, series)}
  </div>;
};
