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

import * as d3 from "d3";
import { immutableEqual } from "immutable-class";
import { Dataset, Datum, NumberRange, PlywoodRange, Range, TimeRange } from "plywood";
import * as React from "react";
import { Stage } from "../../../common/models/index";
import "./chart-line.scss";

const lineFn = d3.svg.line();

export interface ChartLineProps {
  stage: Stage;
  dataset: Dataset;
  getX: (d: Datum) => PlywoodRange;
  getY: (d: Datum) => any;
  scaleX: (v: any) => number;
  scaleY: (v: any) => number;
  color: string;
  dashed?: boolean;
  showArea?: boolean;
  hoverRange?: PlywoodRange;
}

export const ChartLine: React.SFC<ChartLineProps> = ({ stage, dataset, getY, getX, scaleX, scaleY, color, showArea, hoverRange, dashed }) => {
  if (!dataset || !color) return null;

  let dataPoints: Array<[number, number]> = [];
  let hoverDataPoint: [number, number] = null;

  const ds = dataset.data;
  for (let i = 0; i < ds.length; i++) {
    const datum = ds[i];
    const range = getX(datum) as PlywoodRange;

    const incorrectData = !range; // !range => Incorrect data loaded, !Range.isRange => temp solution for non-bucketed reaching here
    if (incorrectData || !Range.isRange(range)) return null;

    const rangeMidpoint = (range as NumberRange | TimeRange).midpoint();
    const measureValue = getY(datum);

    // Add potential pre zero point
    const prevDatum = ds[i - 1];
    if (prevDatum) {
      const prevRange = getX(prevDatum) as PlywoodRange;
      if (prevRange.end.valueOf() !== range.start.valueOf()) {
        dataPoints.push([
          scaleX(rangeMidpoint.valueOf() - ((range.end.valueOf() as any) - (range.start.valueOf() as any))),
          scaleY(0)
        ]);
      }
    }

    // Add the point itself
    const y = scaleY(measureValue);
    const dataPoint: [number, number] = [scaleX(rangeMidpoint), isNaN(y) ? 0 : y];
    dataPoints.push(dataPoint);
    if (hoverRange && immutableEqual(hoverRange, range)) {
      hoverDataPoint = dataPoint;
    }

    // Add potential post zero point
    const nextDatum = ds[i + 1];
    if (nextDatum) {
      const nextRange = getX(nextDatum) as PlywoodRange;
      if (range.end.valueOf() !== nextRange.start.valueOf()) {
        dataPoints.push([
          scaleX(rangeMidpoint.valueOf() + ((range.end.valueOf() as any) - (range.start.valueOf() as any))),
          scaleY(0)
        ]);
      }
    }
  }

  let strokeStyle: React.CSSProperties = null;
  let fillStyle: React.CSSProperties = null;
  if (color !== "default") {
    strokeStyle = { stroke: color };
    fillStyle = { fill: color };
  }
  if (dashed) {
    strokeStyle = { ...strokeStyle, strokeDasharray: "4 2" };
  }

  let areaPath: JSX.Element = null;
  let linePath: JSX.Element = null;
  let singletonCircle: JSX.Element = null;

  if (dataPoints.length > 1) {
    if (showArea) {
      const areaFn = d3.svg.area().y0(scaleY(0));
      areaPath = <path className="area" d={areaFn(dataPoints)}/>;
    }

    linePath = <path className="line" d={lineFn(dataPoints)} style={strokeStyle}/>;
  } else if (dataPoints.length === 1) {
    singletonCircle = <circle
      className="singleton"
      cx={dataPoints[0][0]}
      cy={dataPoints[0][1]}
      r="2"
      style={fillStyle}
    />;
  }

  let hoverCircle: JSX.Element = null;
  if (hoverDataPoint) {
    hoverCircle = <circle
      className="hover"
      cx={hoverDataPoint[0]}
      cy={hoverDataPoint[1]}
      r="2.5"
      style={strokeStyle}
    />;
  }

  return <g className="chart-line" transform={stage.getTransform()}>
    {areaPath}
    {linePath}
    {singletonCircle}
    {hoverCircle}
  </g>;
};
