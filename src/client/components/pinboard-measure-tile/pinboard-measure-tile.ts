'use strict';
require('./pinboard-measure-tile.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ply, $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
// import { ... } from '../../config/constants';
import { Dropdown, DropdownProps } from '../dropdown/dropdown';

function measureEqual(m1: Measure, m2: Measure): boolean {
  return m1 === m2 || m1.equals(m2);
}

function measureName(measure: Measure): string {
  return measure.name;
}

function measureTitle(measure: Measure): string {
  return measure.title;
}

export interface PinboardMeasureTileProps {
  clicker: Clicker;
  essence: Essence;
}

export interface PinboardMeasureTileState {
}

export class PinboardMeasureTile extends React.Component<PinboardMeasureTileProps, PinboardMeasureTileState> {
  public mounted: boolean;

  constructor() {
    super();
    //this.state = {
    //};
  }

  onSelect(measure: Measure) {
    var { clicker } = this.props;
    clicker.changePinnedSortMeasure(measure);
  }

  render() {
    var { clicker, essence } = this.props;

    var measures = essence.dataSource.measures.toArray();
    var measure = essence.getPinnedSortMeasure();

    var dropdown = React.createElement(Dropdown, <DropdownProps<Measure>>{
      label: "Sort by",
      items: measures,
      selectedItem: measure,
      equal: measureEqual,
      renderItem: measureTitle,
      keyItem: measureName,
      onSelect: this.onSelect.bind(this)
    });

    return JSX(`
      <div className="pinboard-measure-tile">
        <div className="title">Pinboard</div>
        {dropdown}
      </div>
    `);
  }
}
