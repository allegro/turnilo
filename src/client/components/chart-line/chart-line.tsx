import Color = d3.Color;
'use strict';
require('./chart-line.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset, Datum, TimeRange } from 'plywood';
import { Stage, Filter, Dimension, Measure } from '../../../common/models/index';
import { TIME_SEGMENT } from '../../config/constants';

const lineFn = d3.svg.line();

export interface ChartLineProps extends React.Props<any> {
  stage: Stage;
  dataset: Dataset;
  getY: (d: Datum) => any;
  scaleX: (v: any) => number;
  scaleY: (v: any) => number;
  color: string;
  showArea?: boolean;
  hoverTimeRange?: TimeRange;
}

export interface ChartLineState {
}

export class ChartLine extends React.Component<ChartLineProps, ChartLineState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { stage, dataset, getY, scaleX, scaleY, color, showArea, hoverTimeRange } = this.props;
    if (!dataset || !color) return null;

    var dataPoints: Array<[number, number]> = [];
    var hoverDataPoint: [number, number] = null;

    var ds = dataset.data;
    for (var i = 0; i < ds.length; i++) {
      var datum = ds[i];
      var timeRange: TimeRange = datum[TIME_SEGMENT];
      if (!timeRange) return null; // Incorrect data loaded

      var timeRangeMidPoint = timeRange.midpoint();
      var measureValue = getY(datum);

      // Add potential pre zero point
      var prevDatum = ds[i - 1];
      if (prevDatum && prevDatum[TIME_SEGMENT].end.valueOf() !== timeRange.start.valueOf()) {
        dataPoints.push([
          scaleX(timeRangeMidPoint.valueOf() - (timeRange.end.valueOf() - timeRange.start.valueOf())),
          scaleY(0)
        ]);
      }

      // Add the point itself
      var dataPoint: [number, number] = [scaleX(timeRangeMidPoint), scaleY(measureValue)];
      dataPoints.push(dataPoint);
      if (hoverTimeRange && hoverTimeRange.equals(timeRange)) {
        hoverDataPoint = dataPoint;
      }

      // Add potential post zero point
      var nextDatum = ds[i + 1];
      if (nextDatum && timeRange.end.valueOf() !== nextDatum[TIME_SEGMENT].start.valueOf()) {
        dataPoints.push([
          scaleX(timeRangeMidPoint.valueOf() + (timeRange.end.valueOf() - timeRange.start.valueOf())),
          scaleY(0)
        ]);
      }
    }

    var areaPath: JSX.Element = null;
    if (showArea) {
      var areaFn = d3.svg.area().y0(scaleY(0));
      areaPath = <path className="area" d={areaFn(dataPoints)}/>;
    }

    var pathStyle: React.CSSProperties = null;
    if (color !== 'default') {
      pathStyle = { stroke: color };
    }

    var hoverElement: JSX.Element = null;
    if (hoverDataPoint) {
      hoverElement = <circle
        className="hover"
        cx={hoverDataPoint[0]}
        cy={hoverDataPoint[1]}
        r="2.5"
        style={pathStyle}
      />;
    }

    return <g className="chart-line" transform={stage.getTransform()}>
      {areaPath}
      <path className="line" d={lineFn(dataPoints)} style={pathStyle}/>
      {hoverElement}
    </g>;
  }
}
