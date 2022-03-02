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
  x: number;
  y: number;
  r?: number;
  setHover(datum: Datum): void;
  resetHover(): void;
}

const POINT_RADIUS = 3;
const HOVER_AREA_MARGIN = 3;

export const Point: React.SFC<PointProps> = ({ datum, x, y, r = POINT_RADIUS, setHover, resetHover }) => {
  return (
    <>
      <circle
        cx={x}
        cy={y}
        r={r}
        className="point"
      />
      <circle
        onMouseEnter={() => setHover(datum)}
        onMouseLeave={() => resetHover()}
        cx={x}
        cy={y}
        r={r + HOVER_AREA_MARGIN}
        stroke="none"
        fill="transparent"
      />
    </>
  );
};

interface ScatterplotPointProps {
  datum: Datum;
  xScale: LinearScale;
  yScale: LinearScale;
  xSeries: ConcreteSeries;
  ySeries: ConcreteSeries;
  setHover(datum: Datum): void;
  resetHover(): void;
}

export const ScatterplotPoint: React.SFC<ScatterplotPointProps> = ({ datum, xScale, yScale, xSeries, ySeries, setHover, resetHover }) => {
  const xValue = xSeries.selectValue(datum);
  const yValue = ySeries.selectValue(datum);

  return (
      <Point datum={datum} x={xScale(xValue)} y={yScale(yValue)} setHover={setHover} resetHover={resetHover} />
  );
};
