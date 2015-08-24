'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import { Timezone } from 'chronology';
import { $, Expression, Executor, InAction, ChainExpression, LiteralExpression, find } from 'plywood';
import { Stage, Essence, DataSource, Filter, SplitCombine, Dimension, Measure, Clicker } from '../../models/index';
import { FilterTile } from '../filter-tile/filter-tile';
import { SplitTile } from '../split-tile/split-tile';
import { DimensionListTile } from '../dimension-list-tile/dimension-list-tile';

interface FilterSplitPanelProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
}

interface FilterSplitPanelState {
}

export class FilterSplitPanel extends React.Component<FilterSplitPanelProps, FilterSplitPanelState> {
  constructor() {
    super();
    //this.state = {};
  }

  render() {
    var { essence, clicker, menuStage } = this.props;

    return JSX(`
      <div className="filter-split-panel">
        <FilterTile clicker={clicker} essence={essence} menuStage={menuStage}/>
        <SplitTile clicker={clicker} essence={essence} menuStage={menuStage}/>
        <DimensionListTile clicker={clicker} essence={essence} menuStage={menuStage}/>
      </div>
    `);
  }
}
