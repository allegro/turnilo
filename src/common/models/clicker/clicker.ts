import { List } from 'immutable';
import { Expression } from 'plywood';
import { DataSource } from '../data-source/data-source';
import { Filter } from '../filter/filter';
import { SplitCombine } from '../split-combine/split-combine';
import { Splits } from '../splits/splits';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';
import { Manifest } from '../manifest/manifest';
import { Colors } from '../colors/colors';
import { VisStrategy } from '../essence/essence';

export interface Clicker {
  changeTimeSelection?(selection: Expression): void;
  changeFilter?(filter: Filter, colors?: Colors): void;
  changeSplits?(splits: Splits, strategy: VisStrategy, colors?: Colors): void;
  changeSplit?(split: SplitCombine, strategy: VisStrategy): void;
  addSplit?(split: SplitCombine, strategy: VisStrategy): void;
  removeSplit?(split: SplitCombine, strategy: VisStrategy): void;
  changeColors?(colors: Colors): void;
  changeVisualization?(visualization: Manifest): void;
  pin?(dimension: Dimension): void;
  unpin?(dimension: Dimension): void;
  changePinnedSortMeasure?(measure: Measure): void;
  toggleMultiMeasureMode?(): void;
  toggleEffectiveMeasure?(measure: Measure): void;
  changeHighlight?(owner: string, measure: string, delta: Filter): void;
  acceptHighlight?(): void;
  dropHighlight?(): void;
}
