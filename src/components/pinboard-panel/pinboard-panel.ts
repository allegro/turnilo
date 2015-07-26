'use strict';

import React = require('react/addons');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
import { DimensionTile } from '../dimension-tile/dimension-tile';
import { MeasuresTile } from '../measures-tile/measures-tile';

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
        <MeasuresTile></MeasuresTile>
        <DimensionTile></DimensionTile>
        <DimensionTile></DimensionTile>
      </div>
    `);
  }
}
