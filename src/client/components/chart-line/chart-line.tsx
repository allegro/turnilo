import Color = d3.Color;
'use strict';
require('./chart-line.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset, Datum } from 'plywood';
import { Stage, Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface ChartLineProps extends React.Props<any> {
  stage: Stage;
  dataset: Dataset;
  getX: (d: Datum) => any;
  getY: (d: Datum) => any;
  scaleX: (v: any) => number;
  scaleY: (v: any) => number;
  color: string;
  showArea?: boolean;
  hoverDatum?: Datum;
}

export interface ChartLineState {
}

export class ChartLine extends React.Component<ChartLineProps, ChartLineState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { stage, dataset, getX, getY, scaleX, scaleY, color, showArea, hoverDatum } = this.props;
    if (!color) return null;

    var xFn = (d: Datum) => scaleX(getX(d));
    var yFn = (d: Datum) => scaleY(getY(d));

    var lineFn = d3.svg.line<Datum>().x(xFn).y(yFn);

    var areaPath: JSX.Element = null;
    if (showArea) {
      var areaFn = d3.svg.area<Datum>().x(xFn).y(yFn).y0(scaleY(0));
      areaPath = <path className="area" d={areaFn(dataset.data)}/>;
    }

    var pathStyle: React.CSSProperties = null;
    if (color !== 'default') {
      pathStyle = { stroke: color };
    }

    var hoverElement: JSX.Element = null;
    if (hoverDatum) {
      hoverElement = <circle
        className="hover"
        cx={xFn(hoverDatum)}
        cy={yFn(hoverDatum)}
        r="2.5"
        style={pathStyle}
      />;
    }

    return <g className="chart-line" transform={stage.getTransform()}>
      {areaPath}
      <path className="line" d={lineFn(dataset.data)} style={pathStyle}/>
      {hoverElement}
    </g>;
  }
}
