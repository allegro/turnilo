require('./dimension-measure-panel.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { clamp } from '../../utils/dom/dom';
import { DimensionListTile } from '../dimension-list-tile/dimension-list-tile';
import { MeasuresTile } from '../measures-tile/measures-tile';

const TOTAL_FLEXES = 7;
const MIN_FLEX = 1;
const MIN_HEIGHT = 150;

export interface DimensionMeasurePanelProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  triggerFilterMenu: Fn;
  triggerSplitMenu: Fn;
  style?: React.CSSProperties;
  getUrlPrefix?: () => string;
}

export interface DimensionMeasurePanelState {
}

export class DimensionMeasurePanel extends React.Component<DimensionMeasurePanelProps, DimensionMeasurePanelState> {

  constructor() {
    super();

  }

  render() {
    const { clicker, essence, menuStage, triggerFilterMenu, triggerSplitMenu, getUrlPrefix, style } = this.props;
    const { dataSource } = essence;

    // Compute relative sizes by diving up TOTAL_FLEXES
    var numDimensions = dataSource.dimensions.size;
    var numMeasures = dataSource.measures.size;

    var dimensionsFlex = clamp(
      Math.ceil(TOTAL_FLEXES * numDimensions / (numDimensions + numMeasures)),
      MIN_FLEX,
      TOTAL_FLEXES - MIN_FLEX
    );
    var measuresFlex = TOTAL_FLEXES - dimensionsFlex;

    var dimensionListStyle: any = { flex: dimensionsFlex };
    if (dimensionsFlex === MIN_FLEX) dimensionListStyle.minHeight = MIN_HEIGHT;

    var measuresStyle: any = { flex: measuresFlex };
    if (measuresFlex === MIN_FLEX) measuresStyle.minHeight = MIN_HEIGHT;

    return <div className="dimension-measure-panel" style={style}>
      <DimensionListTile
        clicker={clicker}
        essence={essence}
        menuStage={menuStage}
        triggerFilterMenu={triggerFilterMenu}
        triggerSplitMenu={triggerSplitMenu}
        getUrlPrefix={getUrlPrefix}
        style={dimensionListStyle}
      />
      <MeasuresTile
        clicker={clicker}
        essence={essence}
        style={measuresStyle}
      />
    </div>;
  }
}
