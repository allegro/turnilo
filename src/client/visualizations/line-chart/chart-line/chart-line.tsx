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

import * as d3 from "d3";
import { Datum } from "plywood";
import React from "react";
import { alphaMain } from "../../../../common/models/colors/colors";
import { Stage } from "../../../../common/models/stage/stage";
import { Unary } from "../../../../common/utils/functional/functional";
import { useSettingsContext } from "../../../views/cube-view/settings-context";
import { ContinuousRange, ContinuousScale } from "../utils/continuous-types";
import "./chart-line.scss";
import { prepareDataPoints } from "./prepare-data-points";

export type Scale = d3.ScaleLinear<number, number>;

export interface ChartLineProps {
  xScale: ContinuousScale;
  yScale: Scale;
  getX: Unary<Datum, ContinuousRange>;
  getY: Unary<Datum, number>;
  color?: string;
  showArea: boolean;
  dashed: boolean;
  dataset: Datum[];
  stage: Stage;
}

export const ChartLine: React.FunctionComponent<ChartLineProps> = props => {
  const { customization: { visualizationColors } } = useSettingsContext();
  const mainColor = visualizationColors.main;
  const { color = mainColor, dashed, getX, getY, dataset, showArea, stage, xScale, yScale } = props;

  const area = d3.area().y0(yScale(0));
  const line = d3.line();

  const points = prepareDataPoints(dataset, getX, getY);
  const scaledPoints = points.map(([x, y]) => [xScale(x), yScale(y)] as [number, number]);
  const hasMultiplePoints = points.length > 1;
  const hasSinglePoint = points.length === 1;

  return <g className="chart-line" transform={stage.getTransform()}>
    {hasMultiplePoints && <path
      className="line"
      d={line(scaledPoints)}
      stroke={color}
      strokeDasharray={dashed ? "4 2" : undefined}/>}
    {hasMultiplePoints && showArea && <path
      className="area"
      fill={alphaMain(visualizationColors)}
      d={area(scaledPoints)}/>}
    {hasSinglePoint && <circle
      className="singleton"
      cx={scaledPoints[0][0]}
      cy={scaledPoints[0][1]}
      r="2"
      style={{ fill: color }}
    />}
  </g>;
};
