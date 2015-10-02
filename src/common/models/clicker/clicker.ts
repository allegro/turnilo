'use strict';

import { List } from 'immutable';
import { TimeRange } from 'plywood';
import { DataSource } from '../data-source/data-source';
import { Filter } from '../filter/filter';
import { SplitCombine } from '../split-combine/split-combine';
import { Splits } from '../splits/splits';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';
import { Manifest } from '../manifest/manifest';

export interface Clicker {
  changeDataSource(dataSource: DataSource): void;
  changeTimeRange(timeRange: TimeRange): void;
  changeFilter(filter: Filter): void;
  changeSplits(splits: Splits, fitVis: boolean): void;
  changeSplit(split: SplitCombine): void;
  addSplit(split: SplitCombine): void;
  removeSplit(split: SplitCombine): void;
  changeVisualization(visualization: Manifest): void;
  pin(dimension: Dimension): void;
  unpin(dimension: Dimension): void;
  changePinnedSortMeasure(measure: Measure): void;
  toggleMeasure(measure: Measure): void;
  changeHighlight(owner: string, delta: Filter): void;
  acceptHighlight(): void;
  dropHighlight(): void;
}
