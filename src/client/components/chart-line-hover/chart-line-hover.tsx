'use strict';
require('./chart-line-hover.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset, Datum } from 'plywood';
// import { ... } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';

export interface ChartLineHoverProps {
  stage: Stage;
  datum: Datum;
  getX: (d: Datum) => any;
  getY: (d: Datum) => any;
  scaleX: (v: any) => number;
  scaleY: (v: any) => number;
}

export interface ChartLineHoverState {
}

export class ChartLineHover extends React.Component<ChartLineHoverProps, ChartLineHoverState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { stage, datum, getX, getY, scaleX, scaleY } = this.props;

    var x = scaleX(getX(datum));
    var y = scaleY(getY(datum));

    return <g className="chart-line-hover" transform={stage.getTransform()}>
        <circle cx={x} cy={y} r="2.5"/>
      </g>;
  }
}
