'use strict';

import { List } from 'immutable';
import { DataSource } from '../data-source/data-source';
import { Filter } from '../filter/filter';
import { SplitCombine } from '../split-combine/split-combine';
import { Dimension } from '../dimension/dimension';

export interface Clicker {
  changeDataSource(dataSource: DataSource): void;
  setFilter(filter: Filter): void;
  changeSplits(splits: List<SplitCombine>): void;
  addSplit(split: SplitCombine): void;
  removeSplit(split: SplitCombine): void;
  selectVisualization(visualization: string): void;
  pinDimension(dimension: Dimension): void;
  unpinDimension(dimension: Dimension): void;
}
