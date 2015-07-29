'use strict';

import { List, OrderedSet } from 'immutable';
import * as React from 'react/addons';
import * as numeral from 'numeral';
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
    (<any>window)['numeral'] = numeral;

    var { dataSource, selectedMeasures } = this.props;

    var rows = dataSource.measures.map(measure => {
      var selected = selectedMeasures.has(measure.name);
      var measureValue = 45321321;
      var measureValueStr = numeral(measureValue).format(measure.format);
      return JSX(`
        <div className={'row' + (selected ? ' selected' : '')} key={measure.name}>
          <div className="measure-name" onClick={this.onMeasureClick.bind(this, measure)}>
            <div className="checkbox"></div>
            <div className="label">{measure.title}</div>
          </div>
          <div className="measure-value">{measureValueStr}</div>
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
