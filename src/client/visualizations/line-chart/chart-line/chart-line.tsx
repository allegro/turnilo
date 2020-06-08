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
import * as React from "react";
import { Stage } from "../../../../common/models/stage/stage";
import { Unary } from "../../../../common/utils/functional/functional";
import { ContinuousRange, ContinuousScale } from "../utils/continuous-types";
import "./chart-line.scss";
import { prepareDataPoints } from "./prepare-data-points";

export type Scale = d3.scale.Linear<number, number>;

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

const stroke = (color: string, dashed: boolean): Pick<React.CSSProperties, "stroke" | "strokeDasharray"> => ({
  stroke: color,
  strokeDasharray: dashed ? "4 2" : undefined
});

export const ChartLine: React.SFC<ChartLineProps> = props => {
  const { color, dashed, getX, getY, dataset, showArea, stage, xScale, yScale } = props;

  const area = d3.svg.area().y0(yScale(0));
  const line = d3.svg.line();

  const points = prepareDataPoints(dataset, getX, getY);
  const scaledPoints = points.map(([x, y]) => [xScale(x), yScale(y)] as [number, number]);
  const hasMultiplePoints = points.length > 1;
  const hasSinglePoint = points.length === 1;

  return <g className="chart-line" transform={stage.getTransform()}>
    {hasMultiplePoints && <path className="line" d={line(scaledPoints)} style={stroke(color, dashed)} />}
    {hasMultiplePoints && showArea && <path className="area" d={area(scaledPoints)} />}
    {hasSinglePoint && <circle
      className="singleton"
      cx={scaledPoints[0][0]}
      cy={scaledPoints[0][1]}
      r="2"
      style={{ fill: color }}
    />}
  </g>;
};
