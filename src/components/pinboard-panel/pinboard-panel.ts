'use strict';

import React = require('react/addons');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
import { DimensionContext } from '../dimension-context/dimension-context';
import { MeasuresContext } from '../measures-context/measures-context';

interface PinboardPanelProps {
}

interface PinboardPanelState {
}

export class PinboardPanel extends React.Component<PinboardPanelProps, PinboardPanelState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: PinboardPanelProps) {

  }

  render() {
    return JSX(`
      <div className="pinboard-panel">
        <MeasuresContext></MeasuresContext>
        <DimensionContext></DimensionContext>
        <DimensionContext></DimensionContext>
      </div>
    `);
  }
}
