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

  onMeasureClick(measure: Measure) {

  }

  render() {
    var { dataSource, selectedMeasures } = this.props;

    var rows = dataSource.measures.map(measure => {
      var selected = selectedMeasures.has(measure.name);
      return JSX(`
        <div className={'row' + (selected ? ' selected' : '')} key={measure.name}>
          <div className="measure-name" onClick={this.onMeasureClick.bind(this, measure)}>
            <div className="checkbox"></div>
            <div className="label">{measure.title}</div>
          </div>
          <div className="measure-value">45M</div>
        </div>
      `);
    });


    return JSX(`
      <div className="measures-tile">
        <TileHeader title="Measures"/>
        <div className="rows">{rows}</div>
      </div>
    `);
  }
}
