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
import { VisStrategy } from '../essence/essence';

export interface Clicker {
  changeDataSource(dataSource: DataSource): void;
  changeTimeRange(timeRange: TimeRange): void;
  changeFilter(filter: Filter): void;
  changeSplits(splits: Splits, strategy: VisStrategy): void;
  changeSplit(split: SplitCombine, strategy: VisStrategy): void;
  addSplit(split: SplitCombine, strategy: VisStrategy): void;
  removeSplit(split: SplitCombine, strategy: VisStrategy): void;
  changeVisualization(visualization: Manifest): void;
  pin(dimension: Dimension): void;
  unpin(dimension: Dimension): void;
  changePinnedSortMeasure(measure: Measure): void;
  toggleMeasure(measure: Measure): void;
  changeHighlight(owner: string, delta: Filter): void;
  acceptHighlight(): void;
  dropHighlight(): void;
}
