/*
 * Copyright 2017-2022 Allegro.pl
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

import { Datum } from "plywood";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import "./scatterplot.scss";

import { LinearScale } from "../../utils/linear-scale/linear-scale";

interface PointProps {
  datum: Datum;
  xScale: LinearScale;
  yScale: LinearScale;
  xSeries: ConcreteSeries;
  ySeries: ConcreteSeries;
  onHover(datum: Datum): void;
}

const POINT_RADIUS = 3;

export const Point: React.SFC<PointProps> = ({ datum, xScale, yScale, xSeries, ySeries, onHover }) => {
  const xValue = xSeries.selectValue(datum);
  const yValue = ySeries.selectValue(datum);

  return (<circle
      onMouseEnter={() => onHover(datum)}
      onMouseLeave={() => onHover(null)}
      cx={xScale(xValue)}
      cy={yScale(yValue)}
      r={POINT_RADIUS}
      className="point"
    />
  );
};
