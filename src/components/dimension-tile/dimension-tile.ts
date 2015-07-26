'use strict';

import React = require('react/addons');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
import { TileHeader } from '../tile-header/tile-header';

interface DimensionTileProps {
}

interface DimensionTileState {
}

export class DimensionTile extends React.Component<DimensionTileProps, DimensionTileState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: DimensionTileProps) {

  }

  render() {
    return JSX(`
      <div className="dimension-tile">
        <TileHeader title="Dim"/>
      </div>
    `);
  }
}
