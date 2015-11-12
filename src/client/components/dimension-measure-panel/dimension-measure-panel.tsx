'use strict';
require('./dimension-measure-panel.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
// import { ... } from '../../config/constants';
// import { SvgIcon } from '../svg-icon/svg-icon';
import { DimensionListTile } from '../dimension-list-tile/dimension-list-tile';
import { MeasuresTile } from '../measures-tile/measures-tile';

export interface DimensionMeasurePanelProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  triggerFilterMenu: Function;
  triggerSplitMenu: Function;
}

export interface DimensionMeasurePanelState {
}

export class DimensionMeasurePanel extends React.Component<DimensionMeasurePanelProps, DimensionMeasurePanelState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    const { clicker, essence, menuStage, triggerFilterMenu, triggerSplitMenu } = this.props;

    return <div className="dimension-measure-panel">
      <DimensionListTile
        clicker={clicker}
        essence={essence}
        menuStage={menuStage}
        triggerFilterMenu={triggerFilterMenu}
        triggerSplitMenu={triggerSplitMenu}
      />
      <MeasuresTile
        clicker={clicker}
        essence={essence}
      />
    </div>;
  }
}
