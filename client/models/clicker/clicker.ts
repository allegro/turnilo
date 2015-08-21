'use strict';

import { List } from 'immutable';
import { $, Expression, TimeRange } from 'plywood';
import { DataSource } from '../data-source/data-source';
import { Filter } from '../filter/filter';
import { SplitCombine } from '../split-combine/split-combine';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';

export interface Clicker {
  changeDataSource(dataSource: DataSource): void;
  changeTimeRange(timeRange: TimeRange): void;
  changeFilter(filter: Filter): void;
  changeSplits(splits: List<SplitCombine>): void;
  addSplit(split: SplitCombine): void;
  removeSplit(split: SplitCombine): void;
  selectVisualization(visualization: string): void;
  pin(dimension: Dimension): void;
  unpin(dimension: Dimension): void;
  toggleMeasure(measure: Measure): void;
}
