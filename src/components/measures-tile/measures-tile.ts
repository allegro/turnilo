'use strict';

import React = require('react/addons');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
import { TileHeader } from '../tile-header/tile-header';

interface MeasuresTileProps {
}

interface MeasuresTileState {
}

export class MeasuresTile extends React.Component<MeasuresTileProps, MeasuresTileState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: MeasuresTileProps) {

  }

  render() {
    return JSX(`
      <div className="measures-tile">
        <TileHeader title="Measures"/>
      </div>
    `);
  }
}
