'use strict';

import { List } from 'immutable';
import { DataSource } from '../data-source/data-source';
import { Filter } from '../filter/filter';
import { SplitCombine } from '../split-combine/split-combine';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';

export interface Clicker {
  changeDataSource(dataSource: DataSource): void;
  changeFilter(filter: Filter): void;
  changeSplits(splits: List<SplitCombine>): void;
  addSplit(split: SplitCombine): void;
  removeSplit(split: SplitCombine): void;
  selectVisualization(visualization: string): void;
  pin(what: string | Dimension): void;
  unpin(what: string | Dimension): void;
  toggleMeasure(measure: Measure): void;
}
