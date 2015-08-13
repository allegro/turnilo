'use strict';

import * as React from 'react/addons';
import { $, Expression, Dispatcher, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface TimeAxisProps {
}

interface TimeAxisState {
}

export class TimeAxis extends React.Component<TimeAxisProps, TimeAxisState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: TimeAxisProps) {

  }

  render() {
    return JSX(`
      <g className="time-axis">
        <text y="20">Time axis goes here</text>
      </g>
    `);
  }
}
