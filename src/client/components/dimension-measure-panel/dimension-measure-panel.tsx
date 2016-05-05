require('./dimension-measure-panel.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { DimensionListTile } from '../dimension-list-tile/dimension-list-tile';
import { MeasuresTile } from '../measures-tile/measures-tile';

export interface DimensionMeasurePanelProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  triggerFilterMenu: Fn;
  triggerSplitMenu: Fn;
  getUrlPrefix?: () => string;
}

export interface DimensionMeasurePanelState {
}

export class DimensionMeasurePanel extends React.Component<DimensionMeasurePanelProps, DimensionMeasurePanelState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    const { clicker, essence, menuStage, triggerFilterMenu, triggerSplitMenu, getUrlPrefix } = this.props;

    return <div className="dimension-measure-panel">
      <DimensionListTile
        clicker={clicker}
        essence={essence}
        menuStage={menuStage}
        triggerFilterMenu={triggerFilterMenu}
        triggerSplitMenu={triggerSplitMenu}
        getUrlPrefix={getUrlPrefix}
      />
      <MeasuresTile
        clicker={clicker}
        essence={essence}
      />
    </div>;
  }
}
