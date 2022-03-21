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

import { Datum } from "plywood";
import React from "react";
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";
import { Delta } from "../../components/delta/delta";
import "./total.scss";

interface DifferenceProps {
  datum: Datum;
  series: ConcreteSeries;
}

const Difference: React.FunctionComponent<DifferenceProps> = ({ datum, series }) => {
  return <React.Fragment>
    <div className="measure-value measure-value--previous">
      {series.formatValue(datum, SeriesDerivation.PREVIOUS)}
    </div>
    <div className="measure-delta-value">
      <Delta
        previousValue={series.selectValue(datum, SeriesDerivation.PREVIOUS)}
        currentValue={series.selectValue(datum, SeriesDerivation.CURRENT)}
        lowerIsBetter={series.measure.lowerIsBetter}
        formatter={series.formatter()} />
    </div>
  </React.Fragment>;
};

export interface TotalProps {
  showPrevious: boolean;
  datum: Datum;
  series: ConcreteSeries;
}

export const Total: React.FunctionComponent<TotalProps> = ({ showPrevious, datum, series }) => {
  return <div className="total">
    <div className="measure-name" title={series.title()}>{series.title()}</div>
    <div className="measure-value">{series.formatValue(datum, SeriesDerivation.CURRENT)}</div>
    {showPrevious && <Difference series={series} datum={datum} />}
  </div>;
};
