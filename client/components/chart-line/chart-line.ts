'use strict';

import * as React from 'react/addons';
import { $, Expression, Dispatcher, Dataset, Datum } from 'plywood';
import { Stage, Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface ChartLineProps {
  dataset: Dataset;
  getX: (d: Datum) => any;
  getY: (d: Datum) => any;
  scaleX: (v: any) => number;
  scaleY: (v: any) => number;
  stage: Stage;
}

interface ChartLineState {
}

export class ChartLine extends React.Component<ChartLineProps, ChartLineState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: ChartLineProps) {

  }

  render() {
    var { dataset, getX, getY, scaleX, scaleY, stage } = this.props;

    var xFn = (d: Datum) => scaleX(getX(d));
    var yFn = (d: Datum) => scaleY(getY(d));

    var areaFn = d3.svg.area<Datum>().x(xFn).y(yFn).y0(scaleY(0));
    var lineFn = d3.svg.line<Datum>().x(xFn).y(yFn);

    return JSX(`
      <g className="chart-line">
        <path className="area" d={areaFn(dataset.data)}/>
        <path className="line" d={lineFn(dataset.data)}/>
      </g>
    `);
  }
}
