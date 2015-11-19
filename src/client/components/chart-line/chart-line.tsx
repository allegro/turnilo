import Color = d3.Color;
'use strict';
require('./chart-line.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset, Datum, TimeRange } from 'plywood';
import { Stage, Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

const lineFn = d3.svg.line();

export interface ChartLineProps extends React.Props<any> {
  stage: Stage;
  dataset: Dataset;
  getX: (d: Datum) => any;
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
    var { stage, dataset, getX, getY, scaleX, scaleY, color, showArea, hoverTimeRange } = this.props;
    if (!dataset || !color) return null;

    var dataPoints: Array<[number, number]> = [];
    var hoverDataPoint: [number, number] = null;

    var ds = dataset.data;
    for (var i = 0; i < ds.length; i++) {
      var datum = ds[i];
      var timeRange = getX(datum);
      var measureValue = getY(datum);
      var dataPoint: [number, number] = [scaleX(timeRange), scaleY(measureValue)];
      dataPoints.push(dataPoint);
      if (hoverTimeRange && hoverTimeRange.equals(timeRange)) {
        hoverDataPoint = dataPoint;
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
