'use strict';

import React = require('react/addons');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Clicker, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { TileHeader } from '../tile-header/tile-header';
import { MenuTable } from "../menu-table/menu-table";

interface DimensionTileProps {
  clicker: Clicker;
  dataSource: DataSource;
  filter: Filter;
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

  selectFilter() {

  }

  render() {
    var { clicker, dataSource, filter, dimension } = this.props;

    return JSX(`
      <div className="dimension-tile">
        <TileHeader title={dimension.title} onClose={clicker.unpinDimension.bind(clicker, dimension)}/>
        <MenuTable
          dataSource={dataSource}
          filter={filter}
          dimension={dimension}
          selectFilter={this.selectFilter.bind(this)}
        />
      </div>
    `);
  }
}
