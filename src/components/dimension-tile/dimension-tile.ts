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
  showSearch: boolean;
}

export class DimensionTile extends React.Component<DimensionTileProps, DimensionTileState> {

  constructor() {
    super();
    this.state = {
      showSearch: false
    };
  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: DimensionTileProps) {

  }

  onSearch() {
    this.setState({ showSearch: true });
  }

  selectFilter() {

  }

  render() {
    var { clicker, dataSource, filter, dimension } = this.props;
    var { showSearch } = this.state;

    return JSX(`
      <div className="dimension-tile">
        <TileHeader
          title={dimension.title}
          onSearch={this.onSearch.bind(this)}
          onClose={clicker.unpinDimension.bind(clicker, dimension)}
        />
        <MenuTable
          dataSource={dataSource}
          filter={filter}
          dimension={dimension}
          selectFilter={this.selectFilter.bind(this)}
          showSearch={showSearch}
          showCheckboxes={false}
        />
      </div>
    `);
  }
}
