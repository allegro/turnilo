'use strict';

import React = require('react/addons');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Clicker, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { TileHeader } from '../tile-header/tile-header';

interface DimensionTileProps {
  clicker: Clicker;
  dataSource: DataSource;
  dimension: Dimension;
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
    var { clicker, dimension } = this.props;

    return JSX(`
      <div className="dimension-tile">
        <TileHeader title={dimension.title} onClose={clicker.unpinDimension.bind(clicker, dimension)}/>
      </div>
    `);
  }
}
