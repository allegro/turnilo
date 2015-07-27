'use strict';

import React = require('react/addons');
import { List, OrderedSet } from 'immutable';
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Clicker, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { DimensionTile } from '../dimension-tile/dimension-tile';
import { MeasuresTile } from '../measures-tile/measures-tile';

interface PinboardPanelProps {
  clicker: Clicker;
  dataSource: DataSource;
  selectedMeasures: OrderedSet<string>;
  pinnedDimensions: OrderedSet<string>;
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
    var { clicker, dataSource, selectedMeasures, pinnedDimensions } = this.props;
    var dimensions = dataSource.dimensions;

    var dimensionTiles = pinnedDimensions.toArray().map((dimensionName) => {
      var dimension: Dimension = dimensions.find(d => d.name === dimensionName);
      return JSX(`
        <DimensionTile
          key={dimension.name}
          clicker={clicker}
          dataSource={dataSource}
          dimension={dimension}
        />
      `);
    });

    return JSX(`
      <div className="pinboard-panel">
        <MeasuresTile clicker={clicker} dataSource={dataSource} selectedMeasures={selectedMeasures}/>
        {dimensionTiles}
      </div>
    `);
  }
}
