'use strict';

import * as React from 'react/addons';
import * as d3 from 'd3';
import { Stage, Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

const TICK_HEIGHT = 5;
const TEXT_OFFSET = 12;

interface TimeAxisProps {
  stage: Stage;
  xTicks: Date[];
  scaleX: any;
}

interface TimeAxisState {
}

export class TimeAxis extends React.Component<TimeAxisProps, TimeAxisState> {
  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { stage, xTicks, scaleX } = this.props;

    //var format = d3.time.format('%b %-d');
    var format = scaleX.tickFormat();

    var lines = xTicks.map((tick: any, i: number) => {
      var x = scaleX(tick);
      return JSX(`
        <line key={String(tick)} x1={x} y1={0} x2={x} y2={TICK_HEIGHT}/>
      `);
    });

    var labelY = TICK_HEIGHT + TEXT_OFFSET;
    var labels = xTicks.map((tick: any, i: number) => {
      var x = scaleX(tick);
      return JSX(`
        <text key={String(tick)} x={x} y={labelY}>{format(tick)}</text>
      `);
    });

    return JSX(`
      <g className="time-axis" transform={stage.getTransform()}>
        {lines}
        {labels}
      </g>
    `);
  }
}
