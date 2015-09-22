'use strict';

import * as React from 'react/addons';
import * as numeral from 'numeral';
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
  measure: Measure;
}

export interface ChartLineHoverState {
}

export class ChartLineHover extends React.Component<ChartLineHoverProps, ChartLineHoverState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { stage, datum, getX, getY, scaleX, scaleY, measure } = this.props;

    var x = scaleX(getX(datum));
    var y = scaleY(getY(datum));

    return JSX(`
      <g className="chart-line-hover" transform={stage.getTransform()}>
        <circle cx={x} cy={y} r="2.5"/>
        <text x={x} y={10}>{numeral(getY(datum)).format(measure.format)}</text>
      </g>
    `);
  }
}
