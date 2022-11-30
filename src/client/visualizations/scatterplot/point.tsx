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
import React from "react";

import { Datum } from "plywood";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import "./scatterplot.scss";

import { lightMain } from "../../../common/models/colors/colors";
import { LinearScale } from "../../utils/linear-scale/linear-scale";
import { useSettingsContext } from "../../views/cube-view/settings-context";

interface PointProps {
  datum: Datum;
  xScale: LinearScale;
  yScale: LinearScale;
  xSeries: ConcreteSeries;
  ySeries: ConcreteSeries;
  setHover(datum: Datum): void;
  resetHover(): void;
}

const POINT_RADIUS = 3;
const HOVER_AREA_RADIUS = 6;

export const Point: React.FunctionComponent<PointProps> = ({ datum, xScale, yScale, xSeries, ySeries, setHover, resetHover }) => {
  const { customization: { visualizationColors } } = useSettingsContext();
  const xValue = xSeries.selectValue(datum);
  const yValue = ySeries.selectValue(datum);

  const stroke = visualizationColors.main;
  const fill = lightMain(visualizationColors);

  return (
    <>
      <circle
        cx={xScale(xValue)}
        cy={yScale(yValue)}
        r={POINT_RADIUS}
        className="point"
        stroke={stroke}
        fill={fill}
      />
      <circle
        onMouseEnter={() => setHover(datum)}
        onMouseLeave={() => resetHover()}
        cx={xScale(xValue)}
        cy={yScale(yValue)}
        r={HOVER_AREA_RADIUS}
        stroke="none"
        fill="transparent"
      />
    </>
  );
};
