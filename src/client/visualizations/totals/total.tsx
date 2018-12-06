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

import { Datum } from "plywood";
import * as React from "react";
import { DataSeries } from "../../../common/models/data-series/data-series";
import { SeriesDerivation } from "../../../common/models/series/series";
import { Delta } from "../../components/delta/delta";
import "./total.scss";

interface DifferenceProps {
  datum: Datum;
  series: DataSeries;
}

const Difference: React.SFC<DifferenceProps> = ({ series, datum }) => {
  return <React.Fragment>
    <div className="measure-value measure-value--previous">
      {series.formatValue(datum, SeriesDerivation.PREVIOUS)}
    </div>
    <div className="measure-delta-value">
      <Delta datum={datum} series={series} />
    </div>
  </React.Fragment>;
};

export interface TotalProps {
  series: DataSeries;
  datum: Datum;
  calculateDelta?: boolean;
}

export const Total: React.SFC<TotalProps> = ({ datum, calculateDelta, series }) => {
  const title = series.title();
  const currentValue = datum ? series.formatValue(datum, SeriesDerivation.CURRENT) : "-";
  return <div className="total">
    <div className="measure-name" title={title}>{title}</div>
    <div className="measure-value">{currentValue}</div>
    {calculateDelta && <Difference
      series={series}
      datum={datum} />}
  </div>;
};
