'use strict';

import React = require('react/addons');
import { List, OrderedSet } from 'immutable';
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Clicker, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { TileHeader } from '../tile-header/tile-header';

interface MeasuresTileProps {
  clicker: Clicker;
  dataSource: DataSource;
  selectedMeasures: OrderedSet<string>;
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
