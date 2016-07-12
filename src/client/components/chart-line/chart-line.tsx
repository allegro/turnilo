require('./chart-line.css');

import { immutableEqual } from 'immutable-class';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as d3 from 'd3';
import { $, Expression, Executor, Dataset, Datum, TimeRange, PlywoodRange, NumberRange } from 'plywood';
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
      if (!range) return null; // Incorrect data loaded

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
