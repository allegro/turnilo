'use strict';
require('./chart-line.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset, Datum } from 'plywood';
import { Stage, Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

const COLORS = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf'
];

export interface ChartLineProps extends React.Props<any> {
  stage: Stage;
  dataset: Dataset;
  getX: (d: Datum) => any;
  getY: (d: Datum) => any;
  scaleX: (v: any) => number;
  scaleY: (v: any) => number;
  showArea: boolean;
  color?: number;

  key?: string;
}

export interface ChartLineState {
}

export class ChartLine extends React.Component<ChartLineProps, ChartLineState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { stage, dataset, getX, getY, scaleX, scaleY, showArea, color } = this.props;

    var xFn = (d: Datum) => scaleX(getX(d));
    var yFn = (d: Datum) => scaleY(getY(d));

    var lineFn = d3.svg.line<Datum>().x(xFn).y(yFn);

    var areaPath: JSX.Element = null;
    if (showArea) {
      var areaFn = d3.svg.area<Datum>().x(xFn).y(yFn).y0(scaleY(0));
      areaPath = <path className="area" d={areaFn(dataset.data)}/>;
    }

    return <g className="chart-line" transform={stage.getTransform()}>
      {areaPath}
      <path className="line" d={lineFn(dataset.data)} stroke={color ? COLORS[color] : null}/>
    </g>;
  }
}
