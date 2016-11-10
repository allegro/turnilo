/*
 * Copyright 2015-2016 Imply Data, Inc.
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

require('./chart-line.css');

import { immutableEqual } from 'immutable-class';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as d3 from 'd3';
import { $, Expression, Executor, Dataset, Datum, TimeRange, PlywoodRange, NumberRange, Range } from 'plywood';
import { Stage, Filter, Dimension, Measure } from '../../../common/models/index';

const lineFn = d3.svg.line();

export interface ChartLineProps extends React.Props<any> {
  stage: Stage;
  dataset: Dataset;
  getX: (d: Datum) => PlywoodRange;
  getY: (d: Datum) => any;
  scaleX: (v: any) => number;
  scaleY: (v: any) => number;
  color: string;
  showArea?: boolean;
  hoverRange?: PlywoodRange;
}

export interface ChartLineState {
}

export class ChartLine extends React.Component<ChartLineProps, ChartLineState> {

  constructor() {
    super();
  }

  render() {
    var { stage, dataset, getY, getX, scaleX, scaleY, color, showArea, hoverRange } = this.props;
    if (!dataset || !color) return null;

    var dataPoints: Array<[number, number]> = [];
    var hoverDataPoint: [number, number] = null;

    var ds = dataset.data;
    for (var i = 0; i < ds.length; i++) {
      var datum = ds[i];
      var range = getX(datum) as PlywoodRange;

      if (!range || !Range.isRange(range)) return null; // !range => Incorrect data loaded, !Range.isRange => temp solution for non-bucketed reaching here

      var rangeMidpoint = (range as NumberRange | TimeRange).midpoint();
      var measureValue = getY(datum);

      // Add potential pre zero point
      var prevDatum = ds[i - 1];
      if (prevDatum) {
        var prevRange = getX(prevDatum) as PlywoodRange;
        if (prevRange.end.valueOf() !== range.start.valueOf()) {
          dataPoints.push([
            scaleX(rangeMidpoint.valueOf() - ((range.end.valueOf() as any) - (range.start.valueOf() as any))),
            scaleY(0)
          ]);
        }
      }

      // Add the point itself
      var y = scaleY(measureValue);
      var dataPoint: [number, number] = [scaleX(rangeMidpoint), isNaN(y) ? 0 : y];
      dataPoints.push(dataPoint);
      if (hoverRange && immutableEqual(hoverRange, range)) {
        hoverDataPoint = dataPoint;
      }

      // Add potential post zero point
      var nextDatum = ds[i + 1];
      if (nextDatum) {
        var nextRange = getX(nextDatum) as PlywoodRange;
        if (range.end.valueOf() !== nextRange.start.valueOf()) {
          dataPoints.push([
            scaleX(rangeMidpoint.valueOf() + ((range.end.valueOf() as any) - (range.start.valueOf() as any))),
            scaleY(0)
          ]);
        }
      }
    }

    var strokeStyle: React.CSSProperties = null;
    var fillStyle: React.CSSProperties = null;
    if (color !== 'default') {
      strokeStyle = { stroke: color };
      fillStyle = { fill: color };
    }

    var areaPath: JSX.Element = null;
    var linePath: JSX.Element = null;
    var singletonCircle: JSX.Element = null;

    if (dataPoints.length > 1) {
      if (showArea) {
        var areaFn = d3.svg.area().y0(scaleY(0));
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

    var hoverCircle: JSX.Element = null;
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
  }
}
