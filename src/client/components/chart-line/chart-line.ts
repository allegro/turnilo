'use strict';

import * as React from 'react/addons';
import { $, Expression, Executor, Dataset, Datum } from 'plywood';
import { Stage, Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface ChartLineProps {
  stage: Stage;
  dataset: Dataset;
  getX: (d: Datum) => any;
  getY: (d: Datum) => any;
  scaleX: (v: any) => number;
  scaleY: (v: any) => number;
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
    var { stage, dataset, getX, getY, scaleX, scaleY } = this.props;

    var xFn = (d: Datum) => scaleX(getX(d));
    var yFn = (d: Datum) => scaleY(getY(d));

    var areaFn = d3.svg.area<Datum>().x(xFn).y(yFn).y0(scaleY(0));
    var lineFn = d3.svg.line<Datum>().x(xFn).y(yFn);

    return JSX(`
      <g className="chart-line" transform={stage.getTransform()}>
        <path className="area" d={areaFn(dataset.data)}/>
        <path className="line" d={lineFn(dataset.data)}/>
      </g>
    `);
  }
}
