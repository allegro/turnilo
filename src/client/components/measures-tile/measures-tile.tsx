'use strict';
require('./measures-tile.css');

import { List, OrderedSet } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { PIN_TITLE_HEIGHT, SEARCH_BOX_HEIGHT, MEASURE_HEIGHT, PIN_PADDING_BOTTOM } from '../../config/constants';
import { hasOwnProperty } from '../../../common/utils/general/general';
import { Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { TileHeader } from '../tile-header/tile-header';
import { Checkbox } from '../checkbox/checkbox';

export interface MeasuresTileProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
}

export interface MeasuresTileState {
  showSearch?: boolean;
}

export class MeasuresTile extends React.Component<MeasuresTileProps, MeasuresTileState> {

  constructor() {
    super();
    this.state = {
      showSearch: false
    };
  }

  toggleSearch() {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
  }

  render() {
    var { clicker, essence } = this.props;
    var { showSearch } = this.state;
    var { dataSource, selectedMeasures } = essence;

    var maxHeight = PIN_TITLE_HEIGHT;

    var rows = dataSource.measures.map(measure => {
      var measureName = measure.name;
      var selected = selectedMeasures.has(measureName);

      return <div
        className={'row' + (selected ? ' selected' : '')}
        key={measureName}
        onClick={clicker.toggleMeasure.bind(clicker, measure)}
      >
        <Checkbox selected={selected}/>
        <div className="label">{measure.title}</div>
      </div>;
    });
    maxHeight += (rows.size + 2) * MEASURE_HEIGHT + PIN_PADDING_BOTTOM;

    const style = {
      flex: rows.size + 2,
      maxHeight
    };

    return <div className="measures-tile" style={style}>
      <div className="title">Measures</div>
      <div className="rows">{rows}</div>
    </div>;
  }
}
